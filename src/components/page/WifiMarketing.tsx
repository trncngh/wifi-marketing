'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const WifiMarketing = () => {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Get URL parameters directly without state
  const site = searchParams.get('site') || ''
  const clientMac = searchParams.get('clientMac') || ''
  const token = searchParams.get('token') || ''
  const apMac = searchParams.get('apMac') || ''
  const ssid = searchParams.get('ssidName') || ''

  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    phone: z
      .string()
      .min(10, { message: 'Please enter a valid phone number' })
      .regex(/^[0-9+\-\s()]*$/, {
        message: 'Please enter a valid phone number',
      }),
  })

  type FormValues = z.infer<typeof formSchema>

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      // Log all form data and URL parameters
      const formData = {
        ...data,
        clientMac,
        apMac,
        site,
        ssid,
        token,
      }

      console.log('Form submission data:', formData)

      const params = new URLSearchParams({
        name: data.name,
        phone: data.phone,
        clientMac: clientMac,
        apMac: apMac,
        site: site,
        ssid: ssid,
        token: token,
      })

      const response = await fetch(`/api/omada-auth?${params.toString()}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Server response:', result)

      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      // You could add error state handling here
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Connection Successful!
            </CardTitle>
            <CardDescription>
              You are now connected to our WiFi network. Enjoy your browsing
              experience!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              You will be automatically redirected to the internet shortly.
            </p>
            <Button className="w-full">Continue Browsing</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to WiFi</CardTitle>
          <CardDescription>
            Please provide your information to access our free WiFi service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Connecting...' : 'Connect to WiFi'}
              </Button>

              <p className="text-muted-foreground mt-4 text-center text-xs">
                By connecting, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
