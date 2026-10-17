# Deployment Checklist — Remote Job Safety Review

Use this checklist only after the repository and production URL are known.

## 1. Create the public repository

Suggested repository name: `remote-job-safety-review`

Upload the project source files. Do not upload local testing screenshots or other temporary artifacts unless intentionally needed for documentation.

## 2. Deploy to Vercel

Import the GitHub repository into Vercel and deploy it as a static site.

After the first production deployment, record the final canonical production URL.

## 3. Enable Web Analytics

Enable Vercel Web Analytics from the Vercel project dashboard. The project already includes the first-party analytics loader. Do not add custom analytics events containing pasted job text, recruiter email addresses, company URLs, checklist responses, or result labels.

## 4. Add production SEO files

Once the final URL is confirmed:

- Add a canonical URL to the page head.
- Add Open Graph URL metadata.
- Create `sitemap.xml` with the public pages.
- Add the absolute sitemap URL to `robots.txt`.
- Update any placeholder URL references in documentation.

Never guess the production URL before deployment.

## 5. Google Search Console

Create a separate URL-prefix property for the final production URL. Use the verification method Google provides for that property. Do not assume a verification tag from another site should be reused.

After verification:

- Submit `sitemap.xml`.
- Inspect the homepage URL.
- Request indexing for the homepage and important supporting pages.

## 6. Live QA before public launch

Verify on the live site:

- Job-text review works on desktop and mobile.
- Safety, clarity, and next-move results change correctly.
- Recruiter-domain comparison remains clearly labeled as a limited signal, not proof.
- The fictional example works.
- Share/copy/download-card controls work.
- Privacy, Disclaimer, Terms, Methodology, Sources, About, and Organizations pages open correctly.
- External FTC, FBI/IC3, USPTO, Copyright Office, and Vercel links are correct.
- Security headers are present.
- Vercel Web Analytics loads without weakening the CSP.
- No third-party stock photos, logos, fonts, screenshots, or unlicensed media have been introduced.

## 7. Public-launch wording

Do not market the tool as determining whether an employer or recruiter is definitely legitimate or fraudulent. Use language such as “review warning signals,” “verify before continuing,” and “educational review.”

Do not use the ® symbol. A preliminary public name search is not a legal trademark clearance opinion.

## 8. Launch and collaboration outreach

Share the live project through the creator portfolio, LinkedIn, relevant job-search communities where self-promotion is permitted, and appropriate workforce/career-development groups. Direct organizations to the Organizations / Collaboration page for custom-tool or partnership inquiries.