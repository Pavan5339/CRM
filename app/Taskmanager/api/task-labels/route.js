import { NextResponse } from 'next/server';
import { requireTaskManager } from '@/utils/api-helpers';

function normalizeLabelName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  return trimmed || null;
}

export async function GET(request) {
  try {
    const auth = await requireTaskManager(request);
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from('task_labels')
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ labels: data || [], success: true });
  } catch (error) {
    console.error('Error fetching task labels:', error);
    return NextResponse.json({ error: 'Failed to fetch task labels', success: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireTaskManager(request);
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const body = await request.json();
    const labelName = normalizeLabelName(body?.name);

    if (!labelName) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('task_labels')
      .upsert({ name: labelName }, { onConflict: 'name' })
      .select('id, name, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ label: data, success: true });
  } catch (error) {
    console.error('Error creating task label:', error);
    return NextResponse.json({ error: 'Failed to create task label', success: false }, { status: 500 });
  }
}
