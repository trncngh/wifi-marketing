import axios, { AxiosError } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

const CONTROLLER_IP = process.env.NEXT_PUBLIC_CONTROLLER_IP
const CONTROLLER_ID = process.env.NEXT_PUBLIC_CONTROLLER_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const path = request.nextUrl.pathname.replace('/api/proxy', '')

    const response = await axios({
      method: 'post',
      url: `https://${CONTROLLER_IP}/${CONTROLLER_ID}${path}`,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true,
    })

    // Forward the response headers
    const headers = new Headers()
    if (response.headers['set-cookie']) {
      const cookies = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie'].join('; ')
        : response.headers['set-cookie']
      headers.set('set-cookie', cookies)
    }

    return NextResponse.json(response.data, {
      status: response.status,
      headers,
    })
  } catch (error) {
    const axiosError = error as AxiosError
    console.error(
      'Proxy error:',
      axiosError.response?.data || axiosError.message
    )
    return NextResponse.json(
      { error: axiosError.response?.data || axiosError.message },
      { status: axiosError.response?.status || 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, csrf-token',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
