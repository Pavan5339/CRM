---
name: crm-ai-skill
description: Guide AI agents to build a scalable, secure, professional, low-bug CRM for the BnC Global Partner Portal using CRM 360 architecture, Supabase, automation, communication integrations, AI guardrails, and production-grade quality checks.
---

# CRM AI Skill

Use this skill whenever building, changing, reviewing, or debugging CRM features for the BnC Global Partner Portal. The CRM must extend the existing React/Vite and Supabase portal instead of becoming a disconnected system.

The goal is a clean CRM 360 system where every contact, partner, lead, inquiry, message, call, follow-up, campaign, AI insight, and user activity is visible from one reliable record.

## Core Principles

- Build for correctness before speed. CRM data is business-critical.
- Prefer simple, explicit flows over clever hidden automation.
- Keep the CRM modular: contacts, companies, leads, partners, activities, follow-ups, communications, campaigns, AI, reports, settings.
- Every business action must create a traceable activity or audit record.
- Never trust frontend-only validation for data, permissions, or business rules.
- Do not duplicate contacts casually. Normalize and match records before creating new ones.
- Design for multiple users, multiple roles, high data volume, and future integrations.
- Use provider webhooks as the source of truth for delivery, read, bounce, call, and campaign statuses.
- Keep AI assistive by default. Human approval is required before AI sends external communication or changes important CRM status.

## CRM Architecture Rules

### 360 Record Rule

Every person or company should resolve to a single CRM profile that can show:

- profile and company details
- source and UTM history
- website form submissions
- partner registration and onboarding status
- service inquiries and lead stages
- follow-up tasks
- WhatsApp, email, and call history
- documents, agreement, and approval status
- campaign membership and results
- AI summaries, scores, and suggestions
- full activity timeline

### Event-Driven Data Flow

For every form submission, partner action, message, call, or automation:

1. Validate input.
2. Normalize email and phone.
3. Store raw submission or provider payload when useful.
4. Find or create the CRM contact.
5. Create or update lead, partner record, campaign recipient, or communication row.
6. Add a `crm_activities` timeline event.
7. Trigger allowed automation.
8. Update dashboards from stored data, not ad hoc frontend state.

### Automation Rules

- Automation must be idempotent. Re-running the same webhook or job must not create duplicate leads, messages, or follow-ups.
- Use unique provider IDs, request IDs, or dedupe keys for external events.
- Long-running or failure-prone actions must run server-side.
- Failed automations must log an error and expose enough context for admin review.
- Do not hide automation from users. Show status, timestamps, owner, and next action.

## Database And Backend Rules


### Schema Rules

- Use UUID primary keys unless the existing project pattern requires otherwise.
- Add `created_at`, `updated_at`, and owner/actor fields where relevant.
- Use foreign keys for CRM relationships.
- Use enums or check constraints for controlled states such as lead stage, priority, approval status, message status, and follow-up status.
- Store flexible provider payloads in JSON metadata columns, but keep important searchable fields as normal columns.
- Add indexes for contact lookup, assigned owner, stage/status filters, due follow-ups, provider IDs, and created dates.
- Add uniqueness constraints for dedupe keys, provider message IDs, provider call IDs, and normalized email/phone rules where appropriate.
- Never store secrets, access tokens, API keys, or private credentials in CRM tables.

### Contact And Duplicate Rules

- Normalize email to lowercase.
- Normalize phone to E.164 where possible.
- Check for existing contacts by normalized email, phone, partner ID, and known provider IDs before insert.
- If a duplicate is found, attach the new event to the existing contact instead of creating a new record.
- Preserve `original_source`; update `latest_source` only when new activity arrives.
- Keep raw form details for audit/debugging, but display clean normalized data in CRM views.

### Backend Rules

- Use Supabase Postgres for CRM data.
- Use Supabase Auth for identity.
- Use Row Level Security for data access.
- Use Supabase Edge Functions or backend API endpoints for provider webhooks, sensitive writes, token generation, AI calls, and automation.
- Keep service-role keys server-side only.
- Validate request body, auth, permissions, and business state in the backend before writing.
- Make webhook endpoints verify provider signatures where supported.
- Return structured errors with safe messages. Log sensitive diagnostic detail server-side only.

## Frontend UI/UX Rules

### Product Shape

- Build the actual CRM workspace first, not a marketing page.
- Use dense, professional, operational UI suitable for repeated admin work.
- Prioritize scanning, filtering, assignment, status updates, and timeline review.
- Avoid decorative layouts that reduce data clarity.

### Required CRM Screens

- Overview dashboard with leads, partners, follow-ups, campaigns, and communication metrics.
- Contact/partner 360 profile with timeline.
- Lead list with stage, priority, owner, next follow-up, and source.
- Partner list with profile completion, agreement, approval, onboarding, and owner.
- Follow-up task board/list.
- WhatsApp inbox/history and campaign report.
- Email history and campaign report.
- Call log and call outcome dashboard.
- AI insights/review panel.
- Settings for integrations, templates, roles, and automation rules.

### UI Rules

- Every list must support search, filters, sorting, pagination or virtualization, and empty/error/loading states.
- Every important row must show status, owner, last activity, and next action.
- Use clear stage labels and consistent colors across modules.
- Use confirmation dialogs for destructive or external actions.
- Disable actions while requests are in progress and prevent double-submit bugs.
- Show provider status clearly: queued, sent, delivered, read, failed, bounced, replied, completed.
- Keep cards for individual repeated items or modals only. Do not nest cards inside cards.
- Ensure responsive layouts work on desktop and mobile without overlapping text.
- Do not expose raw technical IDs to normal users unless needed for support/debugging.

## WhatsApp, Email, Calling, And AI Integration Rules

### WhatsApp

- Use WhatsApp Business API through Meta Cloud API or an approved BSP.
- Require opt-in before sending non-transactional WhatsApp messages.
- Use approved templates for outbound business-initiated messages.
- Store every inbound and outbound message in `crm_whatsapp_messages`.
- Track provider message ID, direction, template, body, status, error, sent, delivered, read, and replied timestamps.
- Webhooks must update message status and create CRM activities.
- Bulk campaigns must use recipient-level status rows and rate/error handling.
- Respect stop/unsubscribe replies and update opt-out immediately.
- AI may suggest replies, but admin approval is required before sending unless a narrow approved auto-reply rule exists.

### Email

- Use a transactional provider such as Brevo for system emails and campaigns.
- Verify sender/domain before production sending.
- Store sent email, template, subject, provider ID, status, opens, clicks, bounces, unsubscribes, and errors.
- Use webhooks for open/click/bounce/unsubscribe status.
- Marketing emails must include unsubscribe handling.
- Email templates must be versioned or auditable enough to understand what was sent.

### Calling

- Use a provider such as Twilio for browser calling.
- Generate browser voice tokens server-side only.
- Store call direction, provider call ID, status, duration, outcome, notes, owner, timestamps, recording URL, and transcript when enabled.
- Add call outcomes such as connected, no answer, busy, wrong number, interested, follow-up, converted, not interested.
- Confirm legal and compliance requirements before enabling recording or transcription.
- After each call, require or prompt for outcome and next follow-up.

### AI

- Use AI for lead scoring, service classification, partner review summaries, reply suggestions, timeline summaries, stuck-lead detection, and recommended next action.
- AI outputs must be structured, validated, and stored with model name, confidence, and input hash.
- Do not allow AI to send external messages, delete records, approve partners, or change major statuses without human approval.
- Never send unnecessary secrets, credentials, or excessive personal data to AI providers.
- Cache/store AI summaries to reduce cost and keep reports stable.
- Log AI actions in `crm_ai_audit_logs`.

## Security And Permission Rules

### Roles

Define explicit CRM roles, for example:

- Super Admin: full CRM and integration control.
- Admin: manage CRM data and team assignments.
- Sales Manager: view team pipeline and reports.
- Sales Agent: manage assigned leads and follow-ups.
- Partner Manager: manage partner lifecycle.
- Support/Calling Agent: manage calls and assigned tasks.
- Read-only/Management: view reports without editing.

### Permission Rules

- Enforce permissions in the backend and database RLS, not only the UI.
- Users should only access records allowed by role, ownership, team, or explicit assignment.
- Separate read, create, update, delete, export, campaign send, integration settings, and AI approval permissions.
- Restrict bulk export and campaign sending to trusted roles.
- Log sensitive actions: export, delete, assignment change, permission change, integration setting change, AI approval, campaign send.
- Use soft delete for important CRM records unless hard deletion is legally required.

### Data Protection

- Keep API keys and provider secrets in environment variables.
- Never expose service-role keys to the browser.
- Mask or limit sensitive fields where roles do not need full access.
- Use HTTPS-only production endpoints.
- Validate CORS and webhook origins/signatures.
- Add rate limits and spam protection for public forms.
- Define data retention for recordings, transcripts, documents, raw submissions, and logs.

## Testing And Bug-Prevention Checklist

Before marking CRM work complete, verify:

- Form validation works on frontend and backend.
- Duplicate contact logic works for same email, same phone, and mixed-case email.
- Every new lead/partner/action creates the correct `crm_activities` timeline event.
- Owner assignment and next follow-up rules work.
- RLS blocks unauthorized reads and writes.
- Role permissions match the UI and backend behavior.
- Public form spam/rate-limit protections exist where needed.
- Webhooks are idempotent and safe to retry.
- WhatsApp opt-in/opt-out logic works.
- Email unsubscribe, bounce, open, and click updates work where configured.
- Call token generation is server-side and call status updates are logged.
- AI output is schema-validated and does not auto-send external communication without approval.
- Loading, empty, error, success, and disabled states are visible in the UI.
- Long lists use pagination or virtualization.
- Filters and reports return consistent counts.
- External provider failures show actionable admin errors without leaking secrets.
- No secrets are committed to the repo.
- Build, lint, type checks, and relevant unit/integration tests pass.
- Manual CRM flow test passes: create lead, assign owner, send/log communication, create follow-up, complete follow-up, review timeline.

## Implementation Sequence

Prefer this order unless the user asks otherwise:

1. CRM foundation: tables, contact dedupe, activities, leads, follow-ups, partner bridge.
2. Website data integration: forms, source tracking, raw submissions, validation, spam checks.
3. Partner CRM upgrade: profile completion, agreement/document status, approval workflow, partner follow-ups.
4. Email integration: templates, sending, webhooks, logs, reporting.
5. WhatsApp integration: templates, opt-in, messages, webhooks, campaigns.
6. Calling integration: click-to-call, token endpoint, call logs, outcomes.
7. AI automation: scoring, summaries, reply suggestions, audit logs, approval flow.
8. Reports and QA: dashboards, team reports, campaign reports, security review, final bug pass.

## Done Definition

A CRM feature is done only when:

- data model and permissions are correct,
- backend validation exists,
- frontend states are complete,
- activities/audits are recorded,
- duplicate and retry cases are handled,
- security risks are checked,
- tests or documented manual verification cover the main flow,
- the feature connects back to the CRM 360 record.
