# Remote Job Safety Review

A privacy-conscious, browser-based educational tool for reviewing remote job opportunities before a job seeker invests more time, sends money, or shares sensitive information.\n\n## Live demo\n\n**Try the tool:** https://remote-job-safety-review.vercel.app/

## What it does

- Checks pasted job/recruiter text for common warning signals described in FTC and FBI/IC3 guidance.
- Separately reviews remote-work clarity: location restrictions, employment arrangement, pay structure, hours/time zone, and equipment policy.
- Produces a practical next-step recommendation: proceed with normal caution, verify first, or pause and verify.
- Generates a privacy-safe share summary and an original browser-generated PNG card that excludes pasted job text and personal contact fields.
- Uses no account, application database, file upload, or server-side text analysis in Version 1.

## Privacy boundary

All job-review logic is in `app.js` and runs in the browser. The project includes the Vercel Web Analytics loader for ordinary page analytics if Analytics is enabled for the deployment. No custom analytics event is sent with pasted text, recruiter email, company URL, checklist answers, or result labels.

## Sources

Primary guidance is paraphrased from the Federal Trade Commission and FBI Internet Crime Complaint Center. See `sources.html` for APA-style references and `methodology.html` for source mapping and limitations. Organizations interested in collaboration or custom educational tools can review `organizations.html`.

## IP / visual policy

The project intentionally uses no third-party stock photography, logos, product screenshots, illustration packs, web fonts, or copied competitor UI. Interface code and copy were written for this project. General facts and methods are not claimed as exclusive property. Third-party names are used only for factual attribution/reference.

## Important limitation

This tool is educational. It cannot prove whether a job, recruiter, employer, email, domain, or offer is legitimate or fraudulent. It is not a consumer reporting agency, background-check service, or substitute for independent verification.

## Creator

Daylise Baber — AI-assisted development workflow, product decisions, testing, source review, and privacy-conscious design.

Portfolio: https://daylise-developer-portfolio.vercel.app/

Copyright © 2026 Daylise Baber. All rights reserved. See `LICENSE`.

Deployment steps are documented in `DEPLOYMENT-CHECKLIST.md`.