import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative font-sans flex flex-col items-center justify-start min-h-screen overflow-hidden">
      {/*Video Background*/}
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

      <main className="relative w-full max-w-xl mt-16 p-8 rounded-3xl shadow-xl bg-white dark:bg-white-900/80 flex flex-col items-center gap-8 z-10">
        {/*BOSSCAP and AMQ logo side by side*/}
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
        {/*Titles*/}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-gray-900 dark:text-white drop-shadow">
            Vehicle Loan System
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
            What would you like to do? (Please use app in Light mode)
          </h2>
        </div>
        {/*Page Buttons*/}
        <div className="flex flex-row gap-6 mt-4">
          <Link
            href="/make_booking"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold text-lg shadow hover:bg-purple-700 transition-colors"
          >
            Booking a Vehicle
          </Link>
          <Link
            href="/edit-view_booking"
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold text-lg shadow hover:bg-gray-800 transition-colors"
          >
            View/Edit Booking
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-1000 font-semibold text-lg shadow hover:bg-gray-400 transition-colors"
          >
            ⚙︎
          </Link>
        </div>
      </main>
    </div>
  );
}
 
