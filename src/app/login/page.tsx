"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    // If already signed in, redirect to homepage/dashboard
    router.push("/")
    return null
  }

  return (
    <div className="relative font-sans flex flex-col items-center justify-start min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <main className="relative w-full max-w-xl mt-16 p-8 rounded-3xl shadow-xl bg-white/90 dark:bg-white-900/80 flex flex-col items-center gap-8 z-10">
        {/* Logos side by side */}
        <div className="flex flex-row items-center justify-center gap-8">
          <Image
            src="/bosscap.png"
            alt="Bosscap Logo"
            width={160}
            height={40}
            className="object-contain"
            priority
          />
          <Image
            src="/amq.png"
            alt="AMQ Logo"
            width={220}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Titles */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-gray-900 dark:text-white drop-shadow">
            Vehicle Loan System
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
            Sign in to continue
          </h2>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => signIn("google")}
          className="mt-4 w-full rounded-lg bg-red-500 px-6 py-3 font-medium text-white shadow hover:bg-red-600 transition"
        >
          Continue with Google
        </button>
      </main>
    </div>
  )
}
