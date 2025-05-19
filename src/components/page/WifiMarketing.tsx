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
import { deviceAuthorization } from '@/lib/service/onPremiseController.service'
import { FormWifi, TFormWifi } from '@/lib/validation/formWifi.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const WifiMarketing = () => {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    status?: 'success' | 'error'
    error?: string
  }>({})

  // Get URL parameters directly without state
  const site = searchParams.get('site') || ''
  const clientMac = searchParams.get('clientMac') || ''
  const token = searchParams.get('token') || ''
  const apMac = searchParams.get('apMac') || ''
  const ssidName = searchParams.get('ssidName') || ''
  const authType = searchParams.get('authType') || '4'
  const time = searchParams.get('t') || ''

  // Initialize form
  const form = useForm<TFormWifi>({
    resolver: zodResolver(FormWifi),
    defaultValues: {
      name: '',
      phone: '',
      clientMac,
      apMac,
      site,
      ssidName,
      authType,
      time,
    },
  })

  const onSubmit = async (data: TFormWifi) => {
    setIsSubmitting(true)
    try {
      const { clientMac, apMac, site, ssidName, authType, time } = data
      const deviceSessionResponse = await deviceAuthorization({
        clientMac,
        apMac,
        site,
        ssidName,
        authType,
        time,
      })

      if (deviceSessionResponse.errorCode !== 0) {
        throw new Error('Failed to submit form')
      }

      setSubmitStatus({ status: 'success' })
    } catch (error) {
      setSubmitStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus.status === 'success') {
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

              <input type="hidden" name="clientMac" value={clientMac} />
              <input type="hidden" name="apMac" value={apMac} />
              <input type="hidden" name="site" value={site} />
              <input type="hidden" name="ssidName" value={ssidName} />
              <input type="hidden" name="token" value={token} />

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
          {submitStatus.status === 'error' && (
            <p className="mt-4 text-center text-xs text-red-300">
              {submitStatus.error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
