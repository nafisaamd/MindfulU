"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { bookingService, type Booking } from "@/lib/services/bookingService"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AdminSessionsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // Get all bookings for admin view
      const allBookings = await bookingService.getAllBookings()
      setBookings(allBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (booking: Booking) => {
    try {
      setLoading(true)
      await bookingService.updateBookingStatus(booking.id!, "completed")
      
      toast.success(
        <div className="space-y-2">
          <p className="font-medium">Session Marked as Complete!</p>
          <div className="text-sm space-y-1">
            <p>Counselor: {booking.counselorName}</p>
            <p>Date: {format(new Date(booking.date), "MMMM d, yyyy")}</p>
            <p>Time: {booking.time}</p>
          </div>
        </div>
      )

      await loadBookings()
    } catch (error) {
      console.error("Error marking session as complete:", error)
      toast.error("Failed to mark session as complete")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Sessions</h1>
        <p className="text-muted-foreground">View and manage all counseling sessions</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>View and manage all counseling sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading sessions...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No sessions found
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
                        <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
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
                    {booking.status === "confirmed" && (
                      <Button 
                        variant="outline"
                        onClick={() => handleMarkComplete(booking)}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 