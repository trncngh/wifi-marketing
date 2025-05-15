'use server'

import { headers } from 'next/headers'
import { TFormWifi } from '../validation/formWifi.zod'

export const submitWifiForm = async (
  _actionStatus: object,
  data: TFormWifi
): Promise<{ serverStatus?: string; error?: string | null }> => {
  //   const { name, phone } = formData
  const headersList = await headers()
  const host = headersList.get('host')
  const url =
    process.env.NODE_ENV === 'development'
      ? `http://${host}`
      : `https://${host}`
  console.log(data)
  try {
    const response = await fetch(`${url}/api/omada-auth`, {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
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
