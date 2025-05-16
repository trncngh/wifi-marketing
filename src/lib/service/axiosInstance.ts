import axios from 'axios'
import https from 'https'
export const controllerAxiosInstance = () => {
  const controllerIp = process.env.CONTROLLER_IP
  const controllerId = process.env.CONTROLLER_ID
  return axios.create({
    baseURL: `https://${controllerIp}/${controllerId}`,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
  })
}

export const axiosInstance = controllerAxiosInstance()
