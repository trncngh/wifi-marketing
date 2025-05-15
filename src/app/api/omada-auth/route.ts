import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const targetUrl = `https://aps1-omada-cloud.tplinkcloud.com/portal/auth?${searchParams.toString()}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // add custom headers here if Omada requires (e.g., API key)
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy GET request failed', details: error.message }, { status: 500 });
  }
}
