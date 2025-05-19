import axios, { AxiosError, AxiosHeaders } from 'axios'
import https from 'https'
import { NextRequest, NextResponse } from 'next/server'

const CONTROLLER_IP = process.env.NEXT_PUBLIC_CONTROLLER_IP
const CONTROLLER_ID = process.env.NEXT_PUBLIC_CONTROLLER_ID
const OPERATOR_NAME = process.env.NEXT_PUBLIC_OPERATOR_NAME
const OPERATOR_PASSWORD = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD

// Create an axios instance that accepts self-signed certificates
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  withCredentials: true,
})

async function getCsrfToken() {
  try {
    const response = await axiosInstance.post(
      `https://${CONTROLLER_IP}/${CONTROLLER_ID}/api/v2/hotspot/login`,
      {
        name: OPERATOR_NAME,
        password: OPERATOR_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0',
          Origin: `https://${CONTROLLER_IP}`,
          Referer: `https://${CONTROLLER_IP}/${CONTROLLER_ID}/login`,
        },
      }
    )

    const cookies = (response.headers as AxiosHeaders).getSetCookie?.()
    if (!cookies || cookies.length === 0) {
      throw new Error('No session cookie received')
    }

    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith('TPOMADA_SESSIONID=')
    )
    if (!sessionCookie) {
      throw new Error('TPOMADA_SESSIONID cookie not found')
    }

    const sessionId = sessionCookie.split(';')[0].split('=')[1]
    const cookieString = sessionCookie.split(';')[0]

    return {
      token: response.data.result.token,
      sessionId,
      cookieString,
    }
  } catch (error) {
    console.error('Error getting CSRF token:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  console.log('start api proxy')
  try {
    const body = await request.json()
    // Get the path from the request URL
    const path = request.nextUrl.pathname.replace('/api/proxy', '')
    console.log('Request path:', path)

    // Get cookies from the incoming request
    const cookieHeader = request.headers.get('cookie')
    console.log('Incoming cookie header:', cookieHeader)

    // Get CSRF token from request headers
    const csrfToken = request.headers.get('csrf-token')

    // If this is a device authorization request, get a fresh CSRF token
    let headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0',
      Origin: `https://${CONTROLLER_IP}`,
      Referer: `https://${CONTROLLER_IP}/${CONTROLLER_ID}/login`,
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...(csrfToken && { 'csrf-token': csrfToken }),
    }

    // If this is a device authorization request, get a fresh CSRF token
    if (path === '/api/v2/hotspot/extPortal/auth') {
      const { token: freshToken, cookieString } = await getCsrfToken()
      headers = {
        ...headers,
        'csrf-token': freshToken,
        Cookie: cookieString,
      }
    }

    const response = await axiosInstance({
      method: 'post',
      url: `https://${CONTROLLER_IP}/${CONTROLLER_ID}${path}`,
      data: body,
      headers,
      maxRedirects: 5,
    })

    console.log('Controller response headers:', response.headers)
    console.log('Controller response status:', response.status)
    console.log('Controller response data:', response.data)

    // Create response with initial headers
    const nextResponse = NextResponse.json(response.data, {
      status: response.status,
    })

    // Handle set-cookie headers using getSetCookie()
    const setCookieHeaders = (response.headers as AxiosHeaders).getSetCookie?.()
    console.log('Set-Cookie headers from controller:', setCookieHeaders)

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Set each cookie as a separate header
      setCookieHeaders.forEach((cookie: string) => {
        console.log('Setting cookie:', cookie)
        // Extract the cookie name and value
        const [cookiePart] = cookie.split(';')
        const [name, value] = cookiePart.split('=')

        // Set the cookie using NextResponse's cookies API
        nextResponse.cookies.set({
          name,
          value,
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        })
      })
    } else {
      console.log('No set-cookie headers in response')
    }

    // Set CORS headers
    nextResponse.headers.set(
      'Access-Control-Allow-Origin',
      request.headers.get('origin') || '*'
    )
    nextResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    nextResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    nextResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, csrf-token, Cookie, User-Agent, Origin, Referer'
    )

    // Copy all other relevant headers
    const relevantHeaders = [
      'content-type',
      'date',
      'connection',
      'keep-alive',
      'transfer-encoding',
    ]

    relevantHeaders.forEach((header) => {
      const value = response.headers[header]
      if (value) {
        nextResponse.headers.set(header, value)
      }
    })

    console.log(
      'Final response headers:',
      Object.fromEntries(nextResponse.headers.entries())
    )
    console.log('Final response cookies:', nextResponse.cookies.getAll())
    return nextResponse
  } catch (error) {
    const axiosError = error as AxiosError
    console.error(
      'Proxy error:',
      axiosError.response?.data || axiosError.message
    )
    if (axiosError.response) {
      console.error('Error response headers:', axiosError.response.headers)
      console.error('Error response status:', axiosError.response.status)
      console.error('Error response data:', axiosError.response.data)
    }
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
        'Content-Type, Authorization, X-Requested-With, csrf-token, Cookie, User-Agent, Origin, Referer',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
