# Exa Webset → GoHighLevel Daily Sync on Vercel

This project demonstrates how to pull leads from an Exa.ai Webset and automatically upsert them into your GoHighLevel CRM using Vercel’s serverless functions and scheduled cron jobs.

## Files

| Path | Purpose |
| --- | --- |
| `api/syncLeads.js` | Serverless function that fetches leads from Exa.ai and upserts them into HighLevel. It runs when invoked by Vercel’s scheduler. |
| `.env.example` | Template showing required environment variables. Copy to `.env` and fill in your own credentials before deploying. |
| `package.json` | Minimal dependencies (`axios`) required by the function. |

## Prerequisites

1. **Exa.ai Webset ID** – Provided in your Exa.ai account. This identifies the dataset to pull leads from.
2. **GoHighLevel API Token** – Generate one from *Settings → Private Integrations → API Keys* in your HighLevel account.
3. **Vercel Account** – Create a free account at [vercel.com](https://vercel.com) if you don’t already have one.

## Setup & Deployment

1. **Clone or download this repo** (for example into a directory called `vercel-exa-highlevel`).

2. **Install dependencies locally** (optional). Run:

   ```bash
   npm install
   ```

3. **Create an environment file**. Duplicate `.env.example` to `.env` and fill in your `HIGHLEVEL_API_TOKEN`. The `EXA_WEBSET_ID` is embedded in the function (`syncLeads.js`), but you can modify it if you want to target a different Webset.

4. **Deploy to Vercel**. Run:

   ```bash
   vercel
   ```

   Follow the prompts. Vercel will detect the `api/` directory and deploy the function.

5. **Set environment variables in Vercel**. In the Vercel dashboard for your project, go to **Settings → Environment Variables** and add `HIGHLEVEL_API_TOKEN` with the value from your HighLevel account. This will allow the function to authenticate when creating/updating contacts.

6. **Create a scheduled trigger**. In your Vercel project dashboard, navigate to **Functions → Triggers** and set up a new **Cron Job** with a schedule like `0 2 * * *` for daily runs at 2 AM UTC. Point it to `/api/syncLeads`. Adjust the time as desired.

## How It Works

1. **Fetch Webset Results** – The function uses `axios` to request the list of results from the specified Webset ID.
2. **Iterate & Validate** – Each result is checked for email or phone before sending to HighLevel. Empty leads are skipped.
3. **Upsert Contact** – The function posts the contact data to the HighLevel Contacts API, adding a default tag `EXA_WEBSET` for segmentation.
4. **Respond** – Vercel returns a JSON response summarizing success and the number of leads processed.

## Customisation

- **Schedule** – Modify the cron expression in the Vercel trigger to change the frequency (hourly, every 6 hours, etc.).
- **Lead Fields** – Adjust the mapping in `syncLeads.js` if your Webset uses different field names or you want to add custom tags/fields.
- **Duplicate Handling** – The current script doesn’t check for existing contacts. You can add a pre-check using HighLevel’s search API to skip duplicates.

## Disclaimer

This code is provided as a template. You should test it in a safe environment before using it in production. Ensure your API tokens remain confidential; never commit your `.env` file to version control.
