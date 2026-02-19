import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Video, Trophy, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Placeholder - In real app this is in layout or separate component */}
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-2xl text-primary">Gymplat</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underlines-offset-4" href="/login">
            Sign In
          </Link>
          <Link className="text-sm font-medium hover:underline underlines-offset-4" href="/signup">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Train Smarter, Not Harder
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Your personal AI coach, workout tracker, and nutrition guide. Join the revolution.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button className="bg-white text-black hover:bg-gray-200" size="lg">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">AI Coaching</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Get personalized advice on form, nutrition, and recovery from our advanced AI.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BarChart2 className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Advanced Analytics</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Track your progressive overload, volume, and estimated 1RM over time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Gamification</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Earn streaks, climb the global leaderboard, and unlock achievements.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2026 Gymplat Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
