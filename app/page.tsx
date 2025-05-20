import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen relative bg-white overflow-hidden">
      {/* Background illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/Asset/Meeting.svg"
          alt="Virtual meeting illustration"
          fill
          className="object-cover w-full h-full opacity-60"
          priority
        />
      </div>

      <header className="container mx-auto p-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow text-white font-extrabold text-2xl">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-green-700 drop-shadow">Virtual Meeting</h1>
        </div>
        <Link href="/login">
          <Button className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all">
            Log in
          </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center text-center relative z-10">
        <div className="max-w-4xl mx-auto bg-white/95 rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Video Meeting</h1>
          <p className="text-xl mb-8">Connect with anyone, anywhere. Start your virtual meeting experience today.</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 bg-green-600 hover:bg-green-700">
              Register Now
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
