import axios from 'axios';

/**
 * This Vercel serverless function fetches results from an Exa.ai Webset and
 * upserts them into the GoHighLevel CRM. It is intended to be invoked by
 * Vercel’s scheduled cron job. To customise behaviour, edit the constants
 * below or map fields differently.
 */

export default async function handler(req, res) {
  // Read sensitive values from environment variables. Only the HighLevel
  // token needs to be set via Vercel’s environment; the Webset ID is
  // hard-coded but can be overridden by creating your own `.env` file.
  const highlevelToken = process.env.HIGHLEVEL_API_TOKEN;
  const exaWebsetId = process.env.EXA_WEBSET_ID || '01kdr96x54vf4ar4x22yq9f7ht';

  // Base endpoints for the two APIs
  const HIGHLEVEL_BASE_URL = 'https://services.leadconnectorhq.com';
  const EXA_BASE_URL = 'https://api.exa.ai/v1';

  // Bail out if no HighLevel token is configured. Vercel will surface
  // this as an error in the function logs.
  if (!highlevelToken) {
    return res.status(500).json({
      success: false,
      error: 'HIGHLEVEL_API_TOKEN environment variable not set.'
    });
  }

  try {
    // 1. Fetch results from the Exa Webset. This endpoint returns a
    // JSON structure with an `items` array. See Exa.ai documentation for
    // details. Remove the Accept header if Exa.ai updates their API.
    const exaResp = await axios.get(`${EXA_BASE_URL}/websets/${exaWebsetId}/results`, {
      headers: {
        Accept: 'application/json'
      }
    });
    const leads = exaResp.data.items || [];

    // Keep a count of how many leads were attempted for upsert.
    let processed = 0;

    // 2. Loop through each lead and send to HighLevel if email/phone present.
    for (const lead of leads) {
      // Skip if there is no contact information. You can adjust this logic
      // depending on your requirements (e.g. phone only or email only).
      if (!lead.email && !lead.phone) {
        continue;
      }

      // Prepare the contact payload for HighLevel. Rename or map fields
      // according to how your Webset is structured. Unknown fields will
      // be ignored by the API. Add tags for segmentation if needed.
      const contactBody = {
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email,
        phone: lead.phone,
        tags: ['EXA_WEBSET'],
      };

      // Use HighLevel Contacts API to create or update contact. See
      // https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts-api/index.html for details.
      try {
        await axios.post(
          `${HIGHLEVEL_BASE_URL}/contacts/`,
          contactBody,
          {
            headers: {
              Authorization: `Bearer ${highlevelToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        processed += 1;
      } catch (hlErr) {
        // Log API errors to console. Vercel will display them in the logs.
        console.error('HighLevel API error:', hlErr.response?.data || hlErr.message);
      }
    }

    return res.status(200).json({ success: true, processed, total: leads.length });
  } catch (err) {
    // Catch network or parsing errors. Provide a generic message to avoid
    // leaking API details to the response.
    console.error('Error during sync:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Failed to sync leads' });
  }
}
