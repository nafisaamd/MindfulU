"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { MessageSquare, Star, Clock, Calendar as CalendarIcon, MapPin, Phone, Mail, GraduationCap, Award, Languages, Clock4 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { bookingService } from "@/lib/services/bookingService"
import { toast } from "sonner"

interface Counselor {
  id: string
  name: string
  title: string
  specialization: string[]
  experience: string
  education: string[]
  languages: string[]
  availability: {
    days: string[]
    hours: string
  }
  rating: number
  reviews: number
  image: string
  bio: string
  contact: {
    phone: string
    email: string
    location: string
  }
  sessionTypes: {
    type: string
    duration: string
    price: string
  }[]
}

const counselors: Counselor[] = [
  {
    id: "dr-adebayo",
    name: "Dr. Oluwaseun Adebayo",
    title: "Clinical Psychologist",
    specialization: ["Anxiety", "Depression", "Academic Stress", "Relationship Issues"],
    experience: "15+ years",
    education: [
      "Ph.D. in Clinical Psychology - University of Ibadan",
      "M.Sc. in Counseling Psychology - University of Lagos",
      "B.Sc. in Psychology - Obafemi Awolowo University"
    ],
    languages: ["English", "Yoruba"],
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9:00 AM - 5:00 PM"
    },
    rating: 4.9,
    reviews: 128,
    image: "/counselors/dr-adebayo.jpg",
    bio: "Dr. Adebayo is the Head of the Counseling Unit at the University of Lagos. She specializes in helping students navigate academic stress and mental health challenges. With over 15 years of experience, she has helped numerous students achieve better mental well-being and academic success.",
    contact: {
      phone: "+234 801 234 5678",
      email: "counseling@unilag.edu.ng",
      location: "University of Lagos Counseling Center, Akoka, Lagos"
    },
    sessionTypes: [
      {
        type: "Individual Session",
        duration: "50 minutes",
        price: "₦15,000"
      },
      {
        type: "Group Session",
        duration: "90 minutes",
        price: "₦8,000"
      }
    ]
  },
  {
    id: "dr-okonkwo",
    name: "Dr. Chukwudi Okonkwo",
    title: "Mental Health Counselor",
    specialization: ["Trauma", "Grief", "Cultural Issues", "Identity"],
    experience: "12+ years",
    education: [
      "Ph.D. in Counseling Psychology - University of Nigeria, Nsukka",
      "M.Sc. in Mental Health Counseling - Ahmadu Bello University",
      "B.Sc. in Psychology - University of Benin"
    ],
    languages: ["English", "Igbo"],
    availability: {
      days: ["Tuesday", "Thursday", "Saturday"],
      hours: "10:00 AM - 6:00 PM"
    },
    rating: 4.8,
    reviews: 95,
    image: "/counselors/dr-okonkwo.jpg",
    bio: "Dr. Okonkwo is the Director of the Student Counseling Center at the University of Nigeria, Nsukka. He is passionate about helping students overcome trauma and cultural challenges. His approach combines traditional counseling methods with cultural sensitivity.",
    contact: {
      phone: "+234 802 345 6789",
      email: "counseling@unn.edu.ng",
      location: "University of Nigeria Counseling Center, Nsukka"
    },
    sessionTypes: [
      {
        type: "Individual Session",
        duration: "50 minutes",
        price: "₦12,000"
      },
      {
        type: "Group Session",
        duration: "90 minutes",
        price: "₦7,000"
      }
    ]
  },
  {
    id: "dr-ibrahim",
    name: "Dr. Fatima Ibrahim",
    title: "Educational Psychologist",
    specialization: ["Learning Disabilities", "ADHD", "Study Skills", "Career Counseling"],
    experience: "10+ years",
    education: [
      "Ph.D. in Educational Psychology - University of Ilorin",
      "M.Ed. in School Counseling - Bayero University",
      "B.Sc. in Psychology - University of Maiduguri"
    ],
    languages: ["English", "Hausa"],
    availability: {
      days: ["Monday", "Tuesday", "Thursday", "Friday"],
      hours: "8:00 AM - 4:00 PM"
    },
    rating: 4.7,
    reviews: 82,
    image: "/counselors/dr-ibrahim.jpg",
    bio: "Dr. Ibrahim is the Head of the Student Support Services at Ahmadu Bello University. She specializes in helping students with learning challenges and career development. She has extensive experience in educational assessment and intervention strategies.",
    contact: {
      phone: "+234 803 456 7890",
      email: "counseling@abu.edu.ng",
      location: "Ahmadu Bello University Counseling Center, Zaria"
    },
    sessionTypes: [
      {
        type: "Individual Session",
        duration: "50 minutes",
        price: "₦13,000"
      },
      {
        type: "Assessment Session",
        duration: "120 minutes",
        price: "₦25,000"
      }
    ]
  },
  {
    id: "dr-ogunleye",
    name: "Dr. Adebayo Ogunleye",
    title: "Clinical Psychologist",
    specialization: ["Substance Abuse", "Addiction", "Crisis Intervention", "Family Therapy"],
    experience: "14+ years",
    education: [
      "Ph.D. in Clinical Psychology - University of Ibadan",
      "M.Sc. in Addiction Psychology - University of Lagos",
      "B.Sc. in Psychology - Obafemi Awolowo University"
    ],
    languages: ["English", "Yoruba"],
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9:00 AM - 5:00 PM"
    },
    rating: 4.9,
    reviews: 112,
    image: "/counselors/dr-ogunleye.jpg",
    bio: "Dr. Ogunleye is the Director of the Student Wellness Center at Obafemi Awolowo University. He specializes in substance abuse prevention and intervention, helping students overcome addiction and develop healthy coping mechanisms.",
    contact: {
      phone: "+234 804 567 8901",
      email: "counseling@oauife.edu.ng",
      location: "Obafemi Awolowo University Wellness Center, Ile-Ife"
    },
    sessionTypes: [
      {
        type: "Individual Session",
        duration: "50 minutes",
        price: "₦14,000"
      },
      {
        type: "Family Session",
        duration: "90 minutes",
        price: "₦20,000"
      }
    ]
  },
  {
    id: "dr-adeyemi",
    name: "Dr. Oluwakemi Adeyemi",
    title: "Career Counselor",
    specialization: ["Career Development", "Academic Planning", "Study Skills", "Time Management"],
    experience: "11+ years",
    education: [
      "Ph.D. in Counseling Psychology - University of Ibadan",
      "M.Sc. in Career Counseling - University of Lagos",
      "B.Sc. in Psychology - University of Ilorin"
    ],
    languages: ["English", "Yoruba"],
    availability: {
      days: ["Tuesday", "Thursday", "Saturday"],
      hours: "10:00 AM - 6:00 PM"
    },
    rating: 4.8,
    reviews: 98,
    image: "/counselors/dr-adeyemi.jpg",
    bio: "Dr. Adeyemi is the Head of Career Services at the University of Ibadan. She specializes in helping students plan their academic and career paths, develop effective study habits, and manage their time efficiently.",
    contact: {
      phone: "+234 805 678 9012",
      email: "careerservices@ui.edu.ng",
      location: "University of Ibadan Career Center, Ibadan"
    },
    sessionTypes: [
      {
        type: "Career Planning Session",
        duration: "60 minutes",
        price: "₦16,000"
      },
      {
        type: "Study Skills Workshop",
        duration: "120 minutes",
        price: "₦10,000"
      }
    ]
  }
]

export default function CounselingPage() {
  const { user } = useAuth()
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedSessionType, setSelectedSessionType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const availableTimeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ]

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("")
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please log in to book a session")
      return
    }

    if (!selectedCounselor || !selectedDate || !selectedTime || !selectedSessionType) {
      toast.error("Please fill in all booking details")
      return
    }

    setIsLoading(true)
    try {
      await bookingService.createBooking({
        userId: user.uid,
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        date: selectedDate,
        time: selectedTime,
        sessionType: selectedSessionType
      })

      toast.success(
        <div className="space-y-2">
          <p className="font-medium">Session Booked Successfully!</p>
          <div className="text-sm space-y-1">
            <p>Counselor: {selectedCounselor.name}</p>
            <p>Date: {format(selectedDate, "MMMM d, yyyy")}</p>
            <p>Time: {selectedTime}</p>
            <p>Session Type: {selectedSessionType}</p>
          </div>
        </div>
      )

      setSelectedTime("")
      setSelectedSessionType("")
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Counseling Services</h1>
        <p className="text-muted-foreground mt-2">
          Book a session with our experienced counselors
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Counselor List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Counselors</h2>
          {counselors.map((counselor) => (
            <Card 
              key={counselor.id}
              className={cn(
                "cursor-pointer transition-colors",
                selectedCounselor?.id === counselor.id && "border-primary"
              )}
              onClick={() => {
                setSelectedCounselor(counselor)
                setSelectedTime("")
                setSelectedSessionType("")
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{counselor.name}</CardTitle>
                    <CardDescription>{counselor.title}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">{counselor.rating}</span>
                    <span className="text-sm text-muted-foreground">({counselor.reviews})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {counselor.specialization.map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {counselor.experience}
                  </div>
                  <div className="flex items-center">
                    <Languages className="h-4 w-4 mr-1" />
                    {counselor.languages.join(", ")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Section */}
    <div className="space-y-6">
          {selectedCounselor ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Book a Session</CardTitle>
                  <CardDescription>
                    Select your preferred date, time, and session type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Session Type</h3>
                    <Select
                      value={selectedSessionType}
                      onValueChange={setSelectedSessionType}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCounselor.sessionTypes.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            {type.type} - {type.duration} ({type.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Select Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Select Time</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {availableTimeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSelectedTime(time)}
                          disabled={isLoading}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleBooking}
                    disabled={isLoading || !selectedDate || !selectedTime || !selectedSessionType}
                  >
                    {isLoading ? "Booking..." : "Book Session"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Counselor Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Education</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedCounselor.education.map((edu) => (
                        <li key={edu} className="text-sm text-muted-foreground">{edu}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Availability</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{selectedCounselor.availability.days.join(", ")}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock4 className="h-4 w-4" />
                      <span>{selectedCounselor.availability.hours}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{selectedCounselor.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedCounselor.contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedCounselor.contact.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">
                  Select a counselor to book a session
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
