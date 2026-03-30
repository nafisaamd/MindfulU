"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, where, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  userId: string
  therapistId: string
  date: Timestamp
  time: string
  status: string
  createdAt: Timestamp
  counselorName?: string
  sessionType?: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'confirm' | 'complete' | 'cancel' | null>(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // Check if user document exists and has admin role
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          toast.error("You don't have admin access")
          router.push('/')
          return
        }

        // If admin access is confirmed, fetch bookings
        await fetchBookings()
      } catch (error) {
        console.error("Error checking admin access:", error)
        setError("Failed to verify admin access. Please try again.")
        toast.error("Error checking admin access")
      }
    }

    checkAdminAccess()
  }, [user, router])

  const fetchBookings = async () => {
    try {
      setError(null)
      const bookingsQuery = query(collection(db, 'bookings'))
      const querySnapshot = await getDocs(bookingsQuery)
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[]
      
      setBookings(bookingsData)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to fetch bookings. Please try again.")
      toast.error("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate()
    return date.toLocaleDateString()
  }

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate()
    return date.toLocaleTimeString()
  }

  const handleAction = async (booking: Booking, action: 'confirm' | 'complete' | 'cancel') => {
    setSelectedBooking(booking)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return

    try {
      setLoading(true)
      const bookingRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(bookingRef, {
        status: actionType === 'confirm' ? 'confirmed' : 
                actionType === 'complete' ? 'completed' : 'cancelled',
        updatedAt: Timestamp.now()
      })

      toast.success(`Session ${actionType}ed successfully`)
      await fetchBookings()
    } catch (error) {
      console.error(`Error ${actionType}ing session:`, error)
      toast.error(`Failed to ${actionType} session`)
    } finally {
      setLoading(false)
      setActionDialogOpen(false)
      setSelectedBooking(null)
      setActionType(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage all therapy session bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Booking ID</p>
                        <p className="text-sm text-muted-foreground">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className={cn("text-sm font-medium", getStatusColor(booking.status))}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Created At</p>
                        <p className="text-sm text-muted-foreground">{formatDate(booking.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(booking, 'confirm')}
                          disabled={booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'cancelled'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(booking, 'complete')}
                          disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(booking, 'cancel')}
                          disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' ? 'Confirm Session' :
               actionType === 'complete' ? 'Complete Session' :
               'Cancel Session'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this session?
              {actionType === 'cancel' && ' This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction}>
              {actionType === 'confirm' ? 'Confirm' :
               actionType === 'complete' ? 'Complete' :
               'Cancel Session'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 