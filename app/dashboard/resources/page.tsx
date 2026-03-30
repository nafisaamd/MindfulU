"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, Video, FileText, ExternalLink, Phone, Users, Wallet, Globe, Heart, Briefcase, Brain, MessageSquare, Shield, BookOpen, GraduationCap, Calendar, Clock, Coffee, Dumbbell, Utensils, Building2, Laptop, Lightbulb, Star, Filter, Search, Globe2, BookMarked, Microscope, TestTube, Calculator, BookOpenCheck, BookOpenText, BookOpenIcon, BookOpenCheckIcon, BookOpenTextIcon, BookOpenIcon as BookOpenIcon2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { resourcesService } from "@/lib/services/resourcesService"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

export interface ResourceLink {
  name: string
  url: string
  description: string
  type: string
}

export interface Resource {
  id: string
  title: string
  description: string
  icon: any
  links: ResourceLink[]
}

const resources: Resource[] = [
  {
    id: "crisis-support",
    title: "Crisis Support",
    description: "Immediate help for mental health crises in Nigeria",
    icon: Phone,
    links: [
      {
        name: "Lagos State Mental Health Helpline",
        url: "https://lagosstateministryofhealth.com/mental-health/",
        description: "0800-800-2000 - 24/7 mental health support",
        type: "emergency"
      },
      {
        name: "Mentally Aware Nigeria Initiative (MANI)",
        url: "https://mentallyaware.org/",
        description: "0800-800-2000 - Mental health support and advocacy",
        type: "support"
      },
      {
        name: "Nigerian Suicide Prevention Initiative",
        url: "https://nspi.org.ng/",
        description: "0800-800-2000 - Suicide prevention and support",
        type: "emergency"
      },
      {
        name: "The Sunshine Series",
        url: "https://thesunshineseries.com/",
        description: "Mental health awareness and support platform",
        type: "support"
      },
      {
        name: "She Writes Woman",
        url: "https://shewriteswoman.org/",
        description: "Mental health support for women",
        type: "support"
      }
    ]
  },
  {
    id: "university-support",
    title: "University Support Services",
    description: "Mental health resources within Nigerian universities",
    icon: Building2,
    links: [
      {
        name: "University of Lagos Counseling Unit",
        url: "https://unilag.edu.ng/counseling/",
        description: "Professional counseling services for students",
        type: "counseling"
      },
      {
        name: "University of Ibadan Health Services",
        url: "https://ui.edu.ng/health-services",
        description: "Mental health and wellness support",
        type: "health"
      },
      {
        name: "Obafemi Awolowo University Counseling Center",
        url: "https://oauife.edu.ng/counseling/",
        description: "Student counseling and mental health services",
        type: "counseling"
      },
      {
        name: "University of Nigeria, Nsukka Health Services",
        url: "https://unn.edu.ng/health-services",
        description: "Comprehensive health and counseling services",
        type: "health"
      },
      {
        name: "Ahmadu Bello University Counseling Center",
        url: "https://abu.edu.ng/counseling",
        description: "Student support and counseling services",
        type: "counseling"
      }
    ]
  },
  {
    id: "academic-support",
    title: "Academic Support",
    description: "Resources for managing academic stress and pressure",
    icon: BookOpen,
    links: [
      {
        name: "Study Skills for Nigerian Students",
        url: "https://www.studentshub.com.ng/study-tips/",
        description: "Effective study techniques and time management",
        type: "study"
      },
      {
        name: "Exam Stress Management",
        url: "https://www.nigerianuniversities.com/exam-stress/",
        description: "Coping strategies for exam periods",
        type: "exam"
      },
      {
        name: "Academic Writing Support",
        url: "https://www.nigerianuniversities.com/writing/",
        description: "Resources for improving academic writing",
        type: "writing"
      },
      {
        name: "Time Management Guide",
        url: "https://www.studenttime.ng/",
        description: "Tools and techniques for better time management",
        type: "study"
      },
      {
        name: "Research Skills Development",
        url: "https://www.studentresearch.ng/",
        description: "Resources for developing research skills",
        type: "study"
      }
    ]
  },
  {
    id: "student-communities",
    title: "Student Communities",
    description: "Support groups and student organizations",
    icon: Users,
    links: [
      {
        name: "Nigerian Students Mental Health Network",
        url: "https://www.nsmhn.org/",
        description: "Student-led mental health support network",
        type: "community"
      },
      {
        name: "Campus Peer Support Groups",
        url: "https://www.studentmentalhealth.ng/peer-support/",
        description: "Find peer support groups on your campus",
        type: "support"
      },
      {
        name: "Student Wellness Clubs",
        url: "https://www.studentwellness.ng/",
        description: "Join student wellness and mental health clubs",
        type: "community"
      },
      {
        name: "Student Leadership Network",
        url: "https://www.studentleaders.ng/",
        description: "Connect with student leaders and mentors",
        type: "community"
      },
      {
        name: "Campus Mental Health Ambassadors",
        url: "https://www.campusambassadors.ng/",
        description: "Join the mental health awareness movement",
        type: "community"
      }
    ]
  },
  {
    id: "financial-support",
    title: "Financial Support",
    description: "Resources for managing financial stress",
    icon: Wallet,
    links: [
      {
        name: "Student Financial Aid Nigeria",
        url: "https://www.studentaid.ng/",
        description: "Scholarships and financial aid information",
        type: "scholarship"
      },
      {
        name: "Student Budgeting Guide",
        url: "https://www.studentfinance.ng/budgeting/",
        description: "Tips for managing student finances",
        type: "finance"
      },
      {
        name: "Part-time Work Opportunities",
        url: "https://www.studentjobs.ng/",
        description: "Flexible work options for students",
        type: "work"
      },
      {
        name: "Student Entrepreneurship Support",
        url: "https://www.studentbusiness.ng/",
        description: "Resources for student entrepreneurs",
        type: "business"
      },
      {
        name: "Financial Literacy Program",
        url: "https://www.studentmoney.ng/",
        description: "Learn essential financial skills",
        type: "finance"
      }
    ]
  },
  {
    id: "cultural-support",
    title: "Cultural & Social Support",
    description: "Resources for navigating cultural and social challenges",
    icon: Globe,
    links: [
      {
        name: "Nigerian Student Cultural Guide",
        url: "https://www.studentculture.ng/",
        description: "Understanding and navigating campus culture",
        type: "culture"
      },
      {
        name: "Student Social Integration",
        url: "https://www.studentsocial.ng/",
        description: "Tips for social integration and making friends",
        type: "social"
      },
      {
        name: "Cultural Identity Support",
        url: "https://www.studentidentity.ng/",
        description: "Resources for maintaining cultural identity",
        type: "culture"
      },
      {
        name: "Intercultural Exchange Programs",
        url: "https://www.studentexchange.ng/",
        description: "Connect with students from different backgrounds",
        type: "social"
      },
      {
        name: "Student Cultural Events",
        url: "https://www.studentevents.ng/",
        description: "Find cultural events and activities",
        type: "culture"
      }
    ]
  },
  {
    id: "physical-health",
    title: "Physical Health & Wellness",
    description: "Resources for maintaining physical health",
    icon: Heart,
    links: [
      {
        name: "Campus Health Services",
        url: "https://www.campushealth.ng/",
        description: "Access to campus health facilities",
        type: "health"
      },
      {
        name: "Student Fitness Programs",
        url: "https://www.studentfitness.ng/",
        description: "Campus fitness and wellness programs",
        type: "fitness"
      },
      {
        name: "Nutrition for Students",
        url: "https://www.studentnutrition.ng/",
        description: "Healthy eating on a student budget",
        type: "nutrition"
      },
      {
        name: "Sports and Recreation",
        url: "https://www.studentsports.ng/",
        description: "Join campus sports and recreational activities",
        type: "fitness"
      },
      {
        name: "Sleep Hygiene Guide",
        url: "https://www.studentsleep.ng/",
        description: "Tips for better sleep habits",
        type: "health"
      }
    ]
  },
  {
    id: "career-planning",
    title: "Career & Future Planning",
    description: "Resources for career development and future planning",
    icon: Briefcase,
    links: [
      {
        name: "Nigerian Student Career Guide",
        url: "https://www.studentcareer.ng/",
        description: "Career planning and development resources",
        type: "career"
      },
      {
        name: "Internship Opportunities",
        url: "https://www.studentinternships.ng/",
        description: "Find internships and work experience",
        type: "internship"
      },
      {
        name: "Graduate Support Services",
        url: "https://www.graduatesupport.ng/",
        description: "Resources for transitioning to work life",
        type: "career"
      },
      {
        name: "Professional Development",
        url: "https://www.studentpro.ng/",
        description: "Skills development and training programs",
        type: "career"
      },
      {
        name: "Alumni Network",
        url: "https://www.studentalumni.ng/",
        description: "Connect with university alumni",
        type: "network"
      }
    ]
  },
  {
    id: "digital-wellness",
    title: "Digital Wellness",
    description: "Resources for maintaining digital well-being",
    icon: Laptop,
    links: [
      {
        name: "Digital Detox Guide",
        url: "https://www.digitaldetox.ng/",
        description: "Tips for managing screen time",
        type: "wellness"
      },
      {
        name: "Online Safety Resources",
        url: "https://www.onlinesafety.ng/",
        description: "Stay safe in digital spaces",
        type: "safety"
      },
      {
        name: "Digital Productivity Tools",
        url: "https://www.digitaltools.ng/",
        description: "Tools for better digital organization",
        type: "tools"
      },
      {
        name: "Social Media Wellness",
        url: "https://www.socialwellness.ng/",
        description: "Healthy social media habits",
        type: "wellness"
      },
      {
        name: "Online Learning Resources",
        url: "https://www.onlinelearning.ng/",
        description: "Digital learning platforms and tools",
        type: "learning"
      }
    ]
  }
]

const selfHelpResources: Resource[] = [
  {
    id: "mindfulness-meditation",
    title: "Mindfulness & Meditation",
    description: "Resources for developing mindfulness and meditation practices",
    icon: Brain,
    links: [
      {
        name: "Mindful Breathing Exercises",
        url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
        description: "Simple breathing techniques for stress relief and focus",
        type: "wellness"
      },
      {
        name: "Guided Meditation Library",
        url: "https://www.headspace.com/meditation/guided-meditation",
        description: "Collection of guided meditations for different needs",
        type: "wellness"
      },
      {
        name: "Mindfulness for Students",
        url: "https://www.mindful.org/mindfulness-for-students/",
        description: "Mindfulness practices specifically for academic life",
        type: "study"
      },
      {
        name: "Body Scan Meditation",
        url: "https://www.mindful.org/body-scan-meditation/",
        description: "Progressive relaxation technique for stress relief",
        type: "wellness"
      },
      {
        name: "Mindful Study Techniques",
        url: "https://www.mindful.org/mindful-studying/",
        description: "How to incorporate mindfulness into your study routine",
        type: "study"
      }
    ]
  },
  {
    id: "stress-management",
    title: "Stress Management",
    description: "Tools and techniques for managing academic and personal stress",
    icon: Shield,
    links: [
      {
        name: "Stress Relief Techniques",
        url: "https://www.helpguide.org/articles/stress/stress-management.htm",
        description: "Quick and effective stress relief methods",
        type: "wellness"
      },
      {
        name: "Exam Stress Management",
        url: "https://www.studentminds.org.uk/examstress.html",
        description: "Strategies for managing exam-related stress",
        type: "exam"
      },
      {
        name: "Time Management Guide",
        url: "https://www.mindtools.com/pages/main/newMN_HTE.htm",
        description: "Effective time management techniques for students",
        type: "study"
      },
      {
        name: "Progressive Muscle Relaxation",
        url: "https://www.healthline.com/health/progressive-muscle-relaxation",
        description: "Step-by-step guide to muscle relaxation",
        type: "wellness"
      },
      {
        name: "Stress Journal Template",
        url: "https://www.therapistaid.com/worksheets/stress-journal.pdf",
        description: "Template for tracking and managing stress triggers",
        type: "tool"
      }
    ]
  },
  {
    id: "personal-development",
    title: "Personal Development",
    description: "Resources for personal growth and skill development",
    icon: Lightbulb,
    links: [
      {
        name: "Goal Setting Workshop",
        url: "https://www.mindtools.com/page6.html",
        description: "Learn to set and achieve meaningful goals",
        type: "skill"
      },
      {
        name: "Habit Formation Guide",
        url: "https://jamesclear.com/habits",
        description: "Science-based approach to building good habits",
        type: "skill"
      },
      {
        name: "Growth Mindset Resources",
        url: "https://www.mindsetworks.com/science/",
        description: "Develop a growth mindset for better learning",
        type: "study"
      },
      {
        name: "Self-Reflection Exercises",
        url: "https://positivepsychology.com/self-reflection-exercises/",
        description: "Tools for personal reflection and growth",
        type: "tool"
      },
      {
        name: "Personal Development Plan",
        url: "https://www.mindtools.com/pages/article/newHTE_93.htm",
        description: "Create your personal development roadmap",
        type: "skill"
      }
    ]
  },
  {
    id: "emotional-wellbeing",
    title: "Emotional Well-being",
    description: "Resources for emotional health and self-care",
    icon: Heart,
    links: [
      {
        name: "Emotional Intelligence Guide",
        url: "https://www.mindtools.com/pages/article/newCDV_59.htm",
        description: "Develop your emotional intelligence skills",
        type: "skill"
      },
      {
        name: "Self-Care Toolkit",
        url: "https://www.mind.org.uk/information-support/tips-for-everyday-living/self-care/",
        description: "Comprehensive self-care resources and tools",
        type: "wellness"
      },
      {
        name: "Emotional Regulation Techniques",
        url: "https://www.helpguide.org/articles/mental-health/emotional-regulation.htm",
        description: "Learn to manage and regulate emotions",
        type: "wellness"
      },
      {
        name: "Positive Psychology Exercises",
        url: "https://positivepsychology.com/positive-psychology-exercises/",
        description: "Activities to boost positive emotions",
        type: "wellness"
      },
      {
        name: "Gratitude Practice Guide",
        url: "https://www.mindful.org/an-introduction-to-mindful-gratitude/",
        description: "Develop a gratitude practice for better well-being",
        type: "wellness"
      }
    ]
  },
  {
    id: "academic-success",
    title: "Academic Success",
    description: "Resources for improving academic performance and study skills",
    icon: GraduationCap,
    links: [
      {
        name: "Study Skills Workshop",
        url: "https://www.mindtools.com/pages/article/newISS_96.htm",
        description: "Comprehensive guide to effective studying",
        type: "study"
      },
      {
        name: "Note-Taking Methods",
        url: "https://www.mindtools.com/pages/article/note-taking-methods.htm",
        description: "Different approaches to effective note-taking",
        type: "study"
      },
      {
        name: "Memory Techniques",
        url: "https://www.mindtools.com/memory.html",
        description: "Memory improvement strategies for students",
        type: "study"
      },
      {
        name: "Critical Thinking Guide",
        url: "https://www.mindtools.com/pages/article/newCT_02.htm",
        description: "Develop your critical thinking skills",
        type: "skill"
      },
      {
        name: "Research Skills Toolkit",
        url: "https://www.mindtools.com/pages/article/research-skills.htm",
        description: "Essential research skills for academic success",
        type: "study"
      }
    ]
  }
]

// Add new resources
const additionalResources: Resource[] = [
  {
    id: "stem-resources",
    title: "STEM Resources",
    description: "Resources for science, technology, engineering, and mathematics students",
    icon: Microscope,
    links: [
      {
        name: "STEM Study Techniques",
        url: "https://www.stemstudy.ng/",
        description: "Specialized study methods for STEM subjects",
        type: "study"
      },
      {
        name: "Lab Safety Guide",
        url: "https://www.labsafety.ng/",
        description: "Essential safety protocols for laboratory work",
        type: "safety"
      },
      {
        name: "STEM Career Paths",
        url: "https://www.stemcareers.ng/",
        description: "Career opportunities in STEM fields",
        type: "career"
      },
      {
        name: "Research Methodology",
        url: "https://www.stemresearch.ng/",
        description: "Guide to conducting scientific research",
        type: "study"
      },
      {
        name: "STEM Mentorship",
        url: "https://www.stemmentors.ng/",
        description: "Connect with STEM professionals",
        type: "mentorship"
      }
    ]
  },
  {
    id: "arts-humanities",
    title: "Arts & Humanities",
    description: "Resources for arts and humanities students",
    icon: BookOpenText,
    links: [
      {
        name: "Creative Writing Workshop",
        url: "https://www.creativewriting.ng/",
        description: "Workshops and resources for writers",
        type: "workshop"
      },
      {
        name: "Art History Resources",
        url: "https://www.arthistory.ng/",
        description: "Comprehensive art history materials",
        type: "study"
      },
      {
        name: "Philosophy Study Guide",
        url: "https://www.philosophy.ng/",
        description: "Resources for philosophy students",
        type: "study"
      },
      {
        name: "Literature Analysis",
        url: "https://www.literature.ng/",
        description: "Tools for literary analysis",
        type: "study"
      },
      {
        name: "Cultural Studies",
        url: "https://www.culturalstudies.ng/",
        description: "Resources for cultural studies",
        type: "study"
      }
    ]
  },
  {
    id: "professional-skills",
    title: "Professional Skills",
    description: "Resources for developing professional skills",
    icon: Briefcase,
    links: [
      {
        name: "Public Speaking",
        url: "https://www.speaking.ng/",
        description: "Improve your presentation skills",
        type: "skill"
      },
      {
        name: "Leadership Development",
        url: "https://www.leadership.ng/",
        description: "Build your leadership capabilities",
        type: "skill"
      },
      {
        name: "Project Management",
        url: "https://www.projectmanagement.ng/",
        description: "Learn project management basics",
        type: "skill"
      },
      {
        name: "Team Collaboration",
        url: "https://www.collaboration.ng/",
        description: "Effective team working skills",
        type: "skill"
      },
      {
        name: "Problem Solving",
        url: "https://www.problemsolving.ng/",
        description: "Develop critical thinking skills",
        type: "skill"
      }
    ]
  },
  {
    id: "research-publications",
    title: "Research & Publications",
    description: "Resources for academic research and publishing",
    icon: BookMarked,
    links: [
      {
        name: "Research Databases",
        url: "https://www.researchdb.ng/",
        description: "Access to academic databases",
        type: "research"
      },
      {
        name: "Publication Guide",
        url: "https://www.publish.ng/",
        description: "Guide to publishing academic work",
        type: "research"
      },
      {
        name: "Citation Tools",
        url: "https://www.citation.ng/",
        description: "Tools for proper citation",
        type: "tool"
      },
      {
        name: "Research Ethics",
        url: "https://www.researchethics.ng/",
        description: "Understanding research ethics",
        type: "research"
      },
      {
        name: "Academic Journals",
        url: "https://www.journals.ng/",
        description: "List of relevant academic journals",
        type: "research"
      }
    ]
  }
]

// Combine existing and new resources
export const allResources: Resource[] = [...resources, ...selfHelpResources, ...additionalResources]

export default function ResourcesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "emergency", label: "Emergency Support" },
    { value: "counseling", label: "Counseling" },
    { value: "study", label: "Study Support" },
    { value: "community", label: "Community" },
    { value: "finance", label: "Financial Support" }
  ]

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'destructive'
      case 'support':
        return 'default'
      case 'counseling':
        return 'secondary'
      case 'health':
        return 'success'
      case 'study':
        return 'info'
      case 'exam':
        return 'warning'
      case 'writing':
        return 'outline'
      case 'community':
        return 'default'
      case 'scholarship':
        return 'success'
      case 'finance':
        return 'secondary'
      case 'work':
        return 'outline'
      case 'business':
        return 'default'
      case 'culture':
        return 'secondary'
      case 'social':
        return 'outline'
      case 'fitness':
        return 'success'
      case 'nutrition':
        return 'info'
      case 'career':
        return 'default'
      case 'internship':
        return 'secondary'
      case 'network':
        return 'outline'
      case 'wellness':
        return 'success'
      case 'safety':
        return 'warning'
      case 'tools':
        return 'secondary'
      case 'learning':
        return 'info'
      case 'workshop':
        return 'secondary'
      case 'research':
        return 'success'
      case 'skill':
        return 'success'
      case 'tool':
        return 'secondary'
      case 'mentorship':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleResourceClick = (title: string) => {
    // Convert title to URL-friendly format
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    router.push(`/dashboard/resources/${slug}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground">Access helpful resources for mental wellness</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Support</CardTitle>
            <CardDescription>Immediate help for mental health crises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Lagos State Mental Health Helpline
                  </CardTitle>
                  <CardDescription>24/7 Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Emergency mental health support in Lagos
                  </p>
                  <Button variant="outline" asChild>
                    <a href="tel:0800-800-2000">Call 0800-800-2000</a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Mentally Aware Nigeria
                  </CardTitle>
                  <CardDescription>Mental Health Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mental health support and advocacy
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://mentallyaware.org/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Nigerian Suicide Prevention
                  </CardTitle>
                  <CardDescription>Crisis Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Suicide prevention and support
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://nspi.org.ng/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Educational Resources</CardTitle>
            <CardDescription>Learn about mental health and wellness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    WHO Mental Health
                  </CardTitle>
                  <CardDescription>World Health Organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive mental health resources
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.who.int/mental_health/mhgap/evidence/students/en/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Coursera Mental Health
                  </CardTitle>
                  <CardDescription>Free Online Courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mental health courses from top universities
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.coursera.org/search?query=mental%20health" target="_blank" rel="noopener noreferrer">
                      Browse Courses
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    NUC Student Guide
                  </CardTitle>
                  <CardDescription>Nigerian Universities Commission</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Student mental health resources
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.nuc.edu.ng/student-mental-health/" target="_blank" rel="noopener noreferrer">
                      Read Guide
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Digital Tools</CardTitle>
            <CardDescription>Apps and online tools for mental wellness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Headspace
                  </CardTitle>
                  <CardDescription>Meditation App</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Guided meditation and mindfulness
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.headspace.com/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    BetterHelp
                  </CardTitle>
                  <CardDescription>Online Therapy</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional online counseling
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.betterhelp.com/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Calm
                  </CardTitle>
                  <CardDescription>Sleep & Meditation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sleep stories and meditation exercises
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.calm.com/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>University Support</CardTitle>
            <CardDescription>Mental health services at Nigerian universities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    UNILAG Counseling
                  </CardTitle>
                  <CardDescription>University of Lagos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Student counseling services
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://unilag.edu.ng/counseling/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    UI Health Services
                  </CardTitle>
                  <CardDescription>University of Ibadan</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Health and wellness support
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://ui.edu.ng/health-services" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    OAU Counseling
                  </CardTitle>
                  <CardDescription>Obafemi Awolowo University</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Student support services
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://oauife.edu.ng/counseling/" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Communities & Support Groups</CardTitle>
            <CardDescription>Connect with peers and support networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Nigerian Students Mental Health Network
                  </CardTitle>
                  <CardDescription>Peer Support Network</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with other students for mutual support
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.nsmhn.org/" target="_blank" rel="noopener noreferrer">
                      Join Network
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Campus Peer Support Groups
                  </CardTitle>
                  <CardDescription>Local Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Find peer support groups on your campus
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentmentalhealth.ng/peer-support/" target="_blank" rel="noopener noreferrer">
                      Find Groups
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Wellness Clubs
                  </CardTitle>
                  <CardDescription>Wellness Activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join student wellness and mental health clubs
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentwellness.ng/" target="_blank" rel="noopener noreferrer">
                      Explore Clubs
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Support</CardTitle>
            <CardDescription>Resources for managing academic stress and success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Study Skills Workshop
                  </CardTitle>
                  <CardDescription>Learning Resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Effective study techniques and time management
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.mindtools.com/pages/article/newISS_96.htm" target="_blank" rel="noopener noreferrer">
                      Access Workshop
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Exam Stress Management
                  </CardTitle>
                  <CardDescription>Stress Relief</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Strategies for managing exam-related stress
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentminds.org.uk/examstress.html" target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Research Skills Toolkit
                  </CardTitle>
                  <CardDescription>Academic Resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Essential research skills for academic success
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.mindtools.com/pages/article/research-skills.htm" target="_blank" rel="noopener noreferrer">
                      Access Toolkit
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical Wellness</CardTitle>
            <CardDescription>Resources for maintaining physical health and wellness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Student Fitness Guide
                  </CardTitle>
                  <CardDescription>Exercise Resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Simple exercises for busy students
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentfitness.ng/" target="_blank" rel="noopener noreferrer">
                      View Guide
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Student Nutrition Guide
                  </CardTitle>
                  <CardDescription>Healthy Eating</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Healthy eating on a student budget
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentnutrition.ng/" target="_blank" rel="noopener noreferrer">
                      Read Guide
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Sleep Hygiene Guide
                  </CardTitle>
                  <CardDescription>Better Sleep</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tips for better sleep habits
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentsleep.ng/" target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career & Future Planning</CardTitle>
            <CardDescription>Resources for career development and future planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Career Planning Guide
                  </CardTitle>
                  <CardDescription>Career Development</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Career planning and development resources
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentcareer.ng/" target="_blank" rel="noopener noreferrer">
                      Access Guide
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Internship Opportunities
                  </CardTitle>
                  <CardDescription>Work Experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Find internships and work experience
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentinternships.ng/" target="_blank" rel="noopener noreferrer">
                      Browse Opportunities
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Development
                  </CardTitle>
                  <CardDescription>Skill Building</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skills development and training programs
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://www.studentpro.ng/" target="_blank" rel="noopener noreferrer">
                      Explore Programs
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

