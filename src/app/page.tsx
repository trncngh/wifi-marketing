import { WifiMarketing } from '@/components/page/WifiMarketing'
import { Wifi } from 'lucide-react'
import { Suspense } from 'react'

export default function WifiAuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/20 p-4">
              <Wifi className="h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Welcome to Our WiFi Network
          </h1>
          <p className="text-lg opacity-90 md:text-xl">
            Complete the form below to get connected and enjoy high-speed
            internet access.
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <WifiMarketing />
        </Suspense>
      </div>
    </div>
  )
}
