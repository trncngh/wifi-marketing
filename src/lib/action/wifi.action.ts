'use server'

import { deviceAuthorization } from '@/lib/service/onPremiseController.service'
import { TFormWifi } from '../validation/formWifi.zod'
export const submitWifiForm = async (
  _actionStatus: object,
  data: TFormWifi
): Promise<{ serverStatus?: string; error?: string | undefined }> => {
  const { clientMac, apMac, site, ssidName, authType, time } = data
  //{name, phone}'s gonna be sent to the other service
  try {
    const deviceSessionResponse = await deviceAuthorization({
      clientMac,
      apMac,
      site,
      ssidName,
      authType,
      time,
    })

    console.log('Device session response:', deviceSessionResponse)

    if (deviceSessionResponse.errorCode !== 0) {
      throw new Error('Failed to submit form')
    }

    return {
      serverStatus: 'success',
    }
  } catch (error) {
    return {
      serverStatus: 'error',
      error: error as string,
    }
  }
}
