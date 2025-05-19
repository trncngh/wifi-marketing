import axios from 'axios'

type TControllerResponse = {
  errorCode?: number
  msg?: string
  result?: {
    token: string
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

// Create a client-side axios instance
const createClientAxiosInstance = () => {
  return axios.create({
    baseURL: '/api/proxy',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
  })
}

export const deviceAuthorization = async (
  deviceSession: TDeviceSession
): Promise<TControllerResponse> => {
  try {
    const axiosInstance = createClientAxiosInstance()
    const response = await axiosInstance.post(
      '/api/v2/hotspot/extPortal/auth',
      deviceSession
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
    console.log(error)
    throw new Error('Failed to authorize device')
  }
}

//this currently mocking data from env
export const getOperatorInfo = async (): Promise<{
  name: string
  password: string
}> => {
  const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME
  const operatorPassword = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD

  if (!operatorName || !operatorPassword) {
    throw new Error('Operator name or password is not set')
  }
  return {
    name: operatorName,
    password: operatorPassword,
  }
}
