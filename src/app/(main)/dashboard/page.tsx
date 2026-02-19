import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Activity, Dumbbell, Utensils, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Athlete'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
        <p className="text-muted-foreground mt-2">Here is your daily activity overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutrition Score</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">5 Days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/workout/new">
              <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors bg-card hover:shadow-md group">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Log Workout</h3>
                    <p className="text-sm text-muted-foreground">Track your weights & sets</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/coach">
              <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors bg-card hover:shadow-md group">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Chat with Makito</h3>
                    <p className="text-sm text-muted-foreground">Get advice & tips</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <div className="text-sm text-muted-foreground">No recent activity</div>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>

      {/* Example of Glass Button Usage */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Experimental Features</h3>
        <button className="glass-button px-6 py-2 rounded-lg text-white font-medium">
          Try Pro Feature (Glass Button)
        </button>
      </div>
    </div>
  )
}
