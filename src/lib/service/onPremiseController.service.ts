import axios from 'axios'
import { axiosInstance } from './axiosInstance'
type TControllerResponse = {
  errorCode?: number
  msg?: string
  result?: {
    token: string
  }
}

export const getCsrfToken = async (
  name: string,
  password: string
): Promise<{ token: string; sessionId: string; cookieString: string }> => {
  try {
    const response = await axiosInstance.post('/api/v2/hotspot/login', {
      name,
      password,
    })
    console.log('Login response:', response.data)

    // Extract session ID from cookies
    const cookies = response.headers['set-cookie']

    if (!cookies || cookies.length === 0) {
      throw new Error('No session cookie received')
    }

    // Find the TPOMADA_SESSIONID cookie
    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith('TPOMADA_SESSIONID=')
    )
    if (!sessionCookie) {
      throw new Error('TPOMADA_SESSIONID cookie not found')
    }

    // Extract just the session ID value
    const sessionId = sessionCookie.split(';')[0].split('=')[1]
    console.log('Extracted session ID:', sessionId)

    // Get the complete cookie string
    const cookieString = sessionCookie.split(';')[0] // Get just the name=value part

    return {
      token: response.data.result.token,
      sessionId,
      cookieString,
    }
  } catch (error) {
    console.error('Error in getCsrfToken:', error)
    throw new Error('Failed to get csrf token')
  }
}

type TDeviceSession = {
  clientMac?: string
  apMac?: string
  site?: string
  ssidName?: string
  authType?: string
  time?: string
}

export const deviceAuthorization = async (
  deviceSession: TDeviceSession
): Promise<TControllerResponse> => {
  const { clientMac, apMac, site, ssidName, authType, time } = deviceSession

  try {
    // Get fresh operator info and CSRF token
    const { name, password } = await getOperatorInfo()
    const { token: csrfToken, cookieString } = await getCsrfToken(
      name,
      password
    )

    // Use the same axios instance to maintain cookies
    const response = await axiosInstance.post(
      '/api/v2/hotspot/extPortal/auth',
      {
        clientMac,
        apMac,
        site,
        ssidName,
        authType,
        time,
      },
      {
        headers: {
          'csrf-token': csrfToken,
          Cookie: cookieString,
        },
      }
    )

    if (
      typeof response.data === 'string' &&
      response.data.includes('<!DOCTYPE HTML>')
    ) {
      throw new Error(
        'Received HTML response instead of JSON. Session might have expired.'
      )
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Request failed with status:', error.response?.status)
      console.error('Error response data:', error.response?.data)
      console.error('Request headers:', error.config?.headers)
      console.error('Request URL:', error.config?.url)
      console.error('Request data:', error.config?.data)
    }
    throw new Error('Failed to authorize device')
  }
}

//this currently mocking data from env
export const getOperatorInfo = async (): Promise<{
  name: string
  password: string
}> => {
  const operatorName = process.env.OPERATOR_NAME
  const operatorPassword = process.env.OPERATOR_PASSWORD

  if (!operatorName || !operatorPassword) {
    throw new Error('Operator name or password is not set')
  }
  return {
    name: operatorName,
    password: operatorPassword,
  }
}
