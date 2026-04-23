import { NextResponse } from 'next/server';

export async function GET(request) {
  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: 'Only HTTP and HTTPS images are supported.' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      cache: 'force-cache',
      headers: {
        Accept: 'image/*',
      },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json({ error: 'Unable to load image.' }, { status: 502 });
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/png';
    const buffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to proxy image.' }, { status: 500 });
  }
}
