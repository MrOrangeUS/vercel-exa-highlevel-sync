import axios from 'axios';

export default async function handler(req, res) {
  const highlevelToken = process.env.HIGHLEVEL_API_TOKEN;
  const exaWebsetId = process.env.EXA_WEBSET_ID || '01kdr96x54vf4ar4x22yq9f7ht';
  const HIGHLEVEL_BASE_URL = 'https://services.leadconnectorhq.com';
  const EXA_BASE_URL = 'https://api.exa.ai/v1';

  if (!highlevelToken) {
    return res.status(500).json({
      success: false,
      error: 'HIGHLEVEL_API_TOKEN environment variable not set.'
    });
  }

  try {
    const exaResp = await axios.get(`${EXA_BASE_URL}/websets/${exaWebsetId}/results`, {
      headers: {
        Accept: 'application/json'
      }
    });
    const leads = exaResp.data.items || [];
    let processed = 0;

    for (const lead of leads) {
      if (!lead.email && !lead.phone) {
        continue;
      }
      const contactBody = {
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email,
        phone: lead.phone,
        tags: ['EXA_WEBSET'],
      };
      try {
        await axios.post(`${HIGHLEVEL_BASE_URL}/contacts/`, contactBody, {
          headers: {
            Authorization: `Bearer ${highlevelToken}`,
            'Content-Type': 'application/json'
          }
        });
        processed += 1;
      } catch (hlErr) {
        console.error('HighLevel API error:', hlErr.response?.data || hlErr.message);
      }
    }

    globalThis.telemetry = {
      lastSync: new Date().toISOString(),
      lastSuccessCount: processed,
      lastTotal: leads.length,
      lastError: null
    };

    return res.status(200).json({ success: true, processed, total: leads.length });
  } catch (err) {
    globalThis.telemetry = {
      lastSync: new Date().toISOString(),
      lastSuccessCount: 0,
      lastTotal: 0,
      lastError: err.message || 'Failed to sync leads'
    };
    console.error('Error during manual sync:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Failed to sync leads' });
  }
}
