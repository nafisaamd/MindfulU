"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Clock, Video } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { appointmentService, Appointment } from "@/lib/services/appointmentService"
import { format } from "date-fns"

export function UpcomingAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user?.uid) {
        try {
          const upcomingAppointments = await appointmentService.getUpcomingAppointments(user.uid)
          setAppointments(upcomingAppointments)
        } catch (error) {
          console.error("Error fetching appointments:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAppointments()
  }, [user])

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId)
      setAppointments(prev => prev.filter(app => app.id !== appointmentId))
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  if (loading) {
    return <div>Loading appointments...</div>
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled counseling sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/counseling/schedule">Schedule Session</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled counseling sessions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/counseling/schedule" className="flex items-center text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-start space-x-4">
            <div className="min-w-[44px] rounded-full bg-teal-100 p-2 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
              {appointment.type === "video" ? (
                <Video className="h-5 w-5" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">{appointment.counselor.name}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{format(appointment.date.toDate(), "MMMM d, yyyy")}</span>
                <Clock className="ml-3 mr-1 h-4 w-4" />
                <span>{format(appointment.date.toDate(), "h:mm a")}</span>
              </div>
              <div className="flex space-x-2">
                {appointment.meetingLink && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={appointment.meetingLink}>Join Session</Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
