import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch('https://aps1-omada-cloud.tplinkcloud.com/portal/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers the Omada API requires here
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy request failed', details: error.message }, { status: 500 });
  }
}
