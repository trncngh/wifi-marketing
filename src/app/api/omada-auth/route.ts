import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);

		const targetUrl = `http://192.168.1.6:8088/portal/auth?${searchParams.toString()}`;

		const response = await fetch(targetUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				// add custom headers here if Omada requires (e.g., API key)
			},
		});

		const data = await response.json();
		console.log(data);

		return NextResponse.json(data, { status: response.status });
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: "Proxy GET request failed",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
