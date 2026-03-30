"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentService, Appointment } from "@/lib/services/appointmentService"
import { useAuth } from "@/components/auth-provider"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentCalendar() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const data = await appointmentService.getUpcomingAppointments(user.uid)
        setAppointments(data)
      } catch (err) {
        setError("Failed to load appointments. Please try again later.")
        console.error("Error fetching appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user?.uid])

  const getAvailableSlots = (selectedDate: Date) => {
    // This is a placeholder for the actual logic to get available slots
    // In a real implementation, this would come from the counselor's availability
    const hours = [9, 10, 11, 13, 14, 15, 16]
    return hours.map(hour => ({
      time: `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`,
      available: true
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const availableSlots = date ? getAvailableSlots(date) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
        <CardDescription>Select a date and time for your appointment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          
          {date && (
            <div className="space-y-2">
              <h3 className="font-medium">Available Time Slots</h3>
              <div className="space-y-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!slot.available}
                  >
                    <span>{slot.time}</span>
                    {slot.available ? (
                      <Badge variant="secondary">Available</Badge>
                    ) : (
                      <Badge variant="destructive">Booked</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {appointments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Upcoming Appointments</h3>
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{format(appointment.date.toDate(), "MMMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(appointment.date.toDate(), "h:mm a")} • {appointment.duration} min
                      </p>
                    </div>
                    <Badge variant="secondary">{appointment.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-teal-600 hover:bg-teal-700">
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  )
}
