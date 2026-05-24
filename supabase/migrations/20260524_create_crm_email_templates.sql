CREATE TABLE IF NOT EXISTS public.crm_email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  subject TEXT NOT NULL,
  preheader TEXT NOT NULL DEFAULT '',
  html_body TEXT NOT NULL,
  plain_text_body TEXT NOT NULL DEFAULT '',
  variables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Archived')),
  source TEXT NOT NULL DEFAULT 'Manual' CHECK (source IN ('Manual', 'AI', 'Seed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for CRM email templates"
  ON public.crm_email_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write access for CRM email templates"
  ON public.crm_email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_crm_email_templates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_email_templates_updated_at ON public.crm_email_templates;
CREATE TRIGGER trg_crm_email_templates_updated_at
BEFORE UPDATE ON public.crm_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_crm_email_templates_updated_at();

INSERT INTO public.crm_email_templates (
  name,
  category,
  subject,
  preheader,
  html_body,
  plain_text_body,
  variables,
  status,
  source
)
VALUES
  (
    'Initial Outreach',
    'Outreach',
    'Helping {{CompanyName}} move faster this quarter',
    'A short note for {{ContactName}} about {{ProductName}}.',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e5e7eb;margin:0;padding:0;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dbe3ef;border-radius:8px;overflow:hidden;"><tr><td style="background:#0f172a;padding:24px 28px;"><div style="font-size:12px;line-height:16px;color:#93c5fd;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">New conversation</div><h1 style="margin:8px 0 0;font-size:26px;line-height:32px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">A practical way to support {{CompanyName}}''s growth</h1></td></tr><tr><td style="padding:28px;color:#334155;font-size:15px;line-height:24px;font-family:Arial,Helvetica,sans-serif;">Hi {{ContactName}},<br><br>I wanted to reach out because teams like <strong>{{CompanyName}}</strong> often use <strong>{{ProductName}}</strong> to improve follow-up speed, visibility, and handoffs across the pipeline.<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;"><tr><td style="background:#2563eb;border-radius:6px;"><a href="#" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Book a quick discussion</a></td></tr></table></td></tr><tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:18px;font-family:Arial,Helvetica,sans-serif;">{{AgentName}} - TasksFlow CRM</td></tr></table></td></tr></table>',
    'Hi {{ContactName}}, I wanted to reach out because teams like {{CompanyName}} often use {{ProductName}} to improve follow-up speed and visibility.',
    ARRAY['ContactName', 'CompanyName', 'AgentName', 'ProductName'],
    'Active',
    'Seed'
  ),
  (
    'Warm Follow-up',
    'Follow-up',
    'Following up on {{CompanyName}}',
    'A quick next step after our last conversation.',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e5e7eb;margin:0;padding:0;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dbe3ef;border-radius:8px;overflow:hidden;"><tr><td style="background:#0f172a;padding:24px 28px;"><div style="font-size:12px;line-height:16px;color:#93c5fd;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Follow-up</div><h1 style="margin:8px 0 0;font-size:26px;line-height:32px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Next steps for {{CompanyName}}</h1></td></tr><tr><td style="padding:28px;color:#334155;font-size:15px;line-height:24px;font-family:Arial,Helvetica,sans-serif;">Hi {{ContactName}},<br><br>Following up on our conversation, I put together a simple next-step path for <strong>{{CompanyName}}</strong>. If useful, I can share the plan by <strong>{{FollowupDate}}</strong> and walk through it with your team.<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;"><tr><td style="background:#2563eb;border-radius:6px;"><a href="#" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Review next steps</a></td></tr></table></td></tr><tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:18px;font-family:Arial,Helvetica,sans-serif;">Sent by {{AgentName}}</td></tr></table></td></tr></table>',
    'Hi {{ContactName}}, following up on our conversation about {{CompanyName}}. I can share a concise next-step plan by {{FollowupDate}} if helpful.',
    ARRAY['ContactName', 'CompanyName', 'AgentName', 'FollowupDate'],
    'Active',
    'Seed'
  )
ON CONFLICT DO NOTHING;
