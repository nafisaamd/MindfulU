"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { bookingService, type Booking } from "@/lib/services/bookingService"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function SessionsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null)
  const [newDate, setNewDate] = useState<Date | undefined>(new Date())
  const [newTime, setNewTime] = useState<string>("")

  const availableTimeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ]

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userBookings = await bookingService.getUserBookings(user.uid)
      setBookings(userBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = (booking: Booking) => {
    setReschedulingBooking(booking)
    setNewDate(new Date(booking.date))
    setNewTime(booking.time)
  }

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking || !newDate || !newTime) {
      toast.error("Please select a new date and time")
      return
    }

    try {
      setLoading(true)
      // First cancel the existing booking
      await bookingService.updateBookingStatus(reschedulingBooking.id!, "cancelled")
      
      // Create a new booking with the new date and time
      await bookingService.createBooking({
        userId: reschedulingBooking.userId,
        counselorId: reschedulingBooking.counselorId,
        counselorName: reschedulingBooking.counselorName,
        date: newDate,
        time: newTime,
        sessionType: reschedulingBooking.sessionType
      })

      toast.success(
        <div className="space-y-2">
          <p className="font-medium">Session Rescheduled Successfully!</p>
          <div className="text-sm space-y-1">
            <p>New Date: {format(newDate, "MMMM d, yyyy")}</p>
            <p>New Time: {newTime}</p>
          </div>
        </div>
      )

      // Reload bookings and close modal
      await loadBookings()
      setReschedulingBooking(null)
    } catch (error) {
      console.error("Error rescheduling booking:", error)
      toast.error("Failed to reschedule session")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Counseling Sessions</h1>
        <p className="text-muted-foreground">Schedule and manage your counseling sessions</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled counseling sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading sessions...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming sessions scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{booking.counselorName}</p>
                        <p className="text-sm text-muted-foreground">{booking.sessionType}</p>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span className={cn(
                            "font-medium",
                            booking.status === "completed" && "text-green-600",
                            booking.status === "cancelled" && "text-red-600",
                            booking.status === "pending" && "text-yellow-600",
                            booking.status === "confirmed" && "text-blue-600"
                          )}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.time}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => handleReschedule(booking)}
                      disabled={booking.status === "cancelled" || booking.status === "completed"}
                    >
                      Reschedule
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book New Session</CardTitle>
            <CardDescription>Schedule a new counseling session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/dashboard/counseling'}>
              Find a Counselor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rescheduling Dialog */}
      <Dialog open={!!reschedulingBooking} onOpenChange={() => setReschedulingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for your session with {reschedulingBooking?.counselorName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Select New Date</h3>
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                className="rounded-md border"
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Select New Time</h3>
              <div className="grid grid-cols-4 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={newTime === time ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setNewTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={handleRescheduleSubmit}
              disabled={!newDate || !newTime}
            >
              Confirm Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 