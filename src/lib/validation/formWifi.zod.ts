import { z } from 'zod'

export const FormWifi = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z
    .string()
    .min(10, { message: 'Please enter a valid phone number' })
    .regex(/^[0-9+\-\s()]*$/, {
      message: 'Please enter a valid phone number',
    }),
  clientMac: z.string().optional(),
  apMac: z.string().optional(),
  site: z.string().optional(),
  ssidName: z.string().optional(),
  authType: z.string().optional(),
  time: z.string().optional(),
})

export type TFormWifi = z.infer<typeof FormWifi>
