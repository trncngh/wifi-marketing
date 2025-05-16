type TControllerResponse = {
  errorCode?: number
  msg?: string
  result?: {
    token: string
  }
}

export const getCfrsToken = async (
  name: string,
  password: string
): Promise<TControllerResponse> => {
  try {
    const response = await fetch(
      `https//${process.env.CONTROLLER_IP}/${process.env.CONTROLLER_ID}/api/v2/hotspot/login`,
      {
        method: 'POST',
        body: JSON.stringify({ name, password }),
      }
    )
    const data = await response.json()
    return data.result.token
  } catch (error) {
    console.error(error)
    throw new Error('Failed to get cfrs token')
  }
}

type TDeviceSession = {
  clientMac: string
  apMac: string
  site: string
  ssid: string
  authType: string
  time: string
}

export const deviceAuthorization = async (
  deviceSession: TDeviceSession & { csrfToken: string }
): Promise<TControllerResponse> => {
  const { csrfToken, clientMac, apMac, site, ssid, authType, time } =
    deviceSession
  try {
    const response = await fetch(
      `https//${process.env.CONTROLLER_IP}/${process.env.CONTROLLER_ID}/api/v2/hotspot/extPortal/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cfrs-Token': csrfToken,
        },
        body: JSON.stringify({ clientMac, apMac, site, ssid, authType, time }),
      }
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw new Error('Failed to authorize device')
  }
}
