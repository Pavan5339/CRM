CREATE TABLE IF NOT EXISTS public.crm_email_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    condition_expression TEXT,
    template_id BIGINT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.crm_email_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all CRM users" ON public.crm_email_triggers
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for admins" ON public.crm_email_triggers
    FOR ALL USING (true);

-- Insert dummy data reflecting mock data
INSERT INTO public.crm_email_triggers (name, event, condition_expression, template_id, status)
VALUES 
  ('New Lead Welcome', 'Lead Created', 'Source = ''Website''', 601, 'Active'),
  ('Qualified Follow-up', 'Lead Status Changed to ''Qualified''', 'None', 602, 'Active'),
  ('Closing MSA Packet', 'Lead Status Changed to ''Won''', 'Priority = ''High''', 603, 'Paused')
ON CONFLICT DO NOTHING;
