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
import { submitWifiForm } from '@/lib/action/wifi.action'
import { FormWifi, TFormWifi } from '@/lib/validation/formWifi.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { startTransition, useActionState } from 'react'
import { useForm } from 'react-hook-form'

export const WifiMarketing = () => {
  const searchParams = useSearchParams()

  // Get URL parameters directly without state
  const site = searchParams.get('site') || ''
  const clientMac = searchParams.get('clientMac') || ''
  const token = searchParams.get('token') || ''
  const apMac = searchParams.get('apMac') || ''
  const ssid = searchParams.get('ssidName') || ''

  // Initialize form
  const form = useForm<TFormWifi>({
    resolver: zodResolver(FormWifi),
    defaultValues: {
      name: '',
      phone: '',
      clientMac,
      apMac,
      site,
      ssid,
    },
  })

  const [actionStatus, formAction, isPending] = useActionState(submitWifiForm, {
    serverStatus: undefined,
    error: undefined,
  })

  const formSubmitAction = form.handleSubmit(async (data) => {
    startTransition(() => {
      formAction(data)
    })
  })

  // Handle form submission
  //   async function onSubmit(data: FormValues) {
  //     setIsSubmitting(true)

  //     try {
  //       // Log all form data and URL parameters
  //       const formData = {
  //         ...data,
  //         clientMac,
  //         apMac,
  //         site,
  //         ssid,
  //         token,
  //       }

  //       console.log('Form submission data:', formData)

  //       const response = await fetch(`/api/omada-auth`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(formData),
  //       })

  //       if (!response.ok) {
  //         const errorData = await response.json()
  //         throw new Error(
  //           errorData.error || `Server responded with status: ${response.status}`
  //         )
  //       }

  //       const result = await response.json()
  //       console.log('Server response:', result)

  //       setIsSuccess(true)
  //     } catch (error) {
  //       console.error('Error submitting form:', error)
  //       // You could add error state handling here
  //     } finally {
  //       setIsSubmitting(false)
  //     }
  //   }

  if (actionStatus?.serverStatus === 'success') {
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
            <form onSubmit={formSubmitAction} className="space-y-6">
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
              <input type="hidden" name="ssid" value={ssid} />
              <input type="hidden" name="token" value={token} />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                disabled={isPending}
              >
                {isPending ? 'Connecting...' : 'Connect to WiFi'}
              </Button>

              <p className="text-muted-foreground mt-4 text-center text-xs">
                By connecting, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </form>
          </Form>
          {actionStatus && (
            <p className="text-muted-foreground mt-4 text-center text-xs">
              {actionStatus.serverStatus}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
