"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar as CalendarIcon, Clock, BookOpen, Timer, Coffee } from "lucide-react"
import { studyStressService, type StudySession } from "@/lib/services/studyStressService"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudyStressPage() {
  const { user, loading: authLoading } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [newSession, setNewSession] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    notes: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingStep, setBreathingStep] = useState(0)
  const [breathingProgress, setBreathingProgress] = useState(0)
  const [breathingInterval, setBreathingInterval] = useState<NodeJS.Timeout | null>(null)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [pomodoroInterval, setPomodoroInterval] = useState<NodeJS.Timeout | null>(null)
  const [breakReminderActive, setBreakReminderActive] = useState(false)
  const [breakInterval, setBreakInterval] = useState(30) // 30 minutes
  const [breakReminderInterval, setBreakReminderInterval] = useState<NodeJS.Timeout | null>(null)

  // Breathing exercise steps with more detailed instructions
  const breathingSteps = [
    { text: "Breathe in through your nose for 4 seconds", duration: 4000, instruction: "Inhale slowly and deeply" },
    { text: "Hold your breath for 7 seconds", duration: 7000, instruction: "Feel your chest expand" },
    { text: "Exhale through your mouth for 8 seconds", duration: 8000, instruction: "Release tension as you exhale" },
    { text: "Rest for 4 seconds", duration: 4000, instruction: "Notice how you feel" },
    { text: "Repeat 3 more times", duration: 0, instruction: "Continue the cycle" }
  ]

  // Pomodoro settings
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4
  })
  const [pomodoroSessionCount, setPomodoroSessionCount] = useState(1)
  const [isBreak, setIsBreak] = useState(false)

  // Format time for display (for study sessions)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format timer display (for Pomodoro)
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadStudySessions()
    }
  }, [user, authLoading])

  const loadStudySessions = async () => {
    if (!user || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sessions = await studyStressService.getStudySessions(user.uid, date);
      setStudySessions(sessions);
    } catch (error) {
      console.error('Error loading study sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load study sessions');
      toast.error(error instanceof Error ? error.message : 'Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    if (!user || initializing) return

    try {
      setInitializing(true)
      await studyStressService.initializeDefaultData()
      toast.success("Study stress features initialized successfully")
      // Reload study sessions after initialization
      await loadStudySessions()
    } catch (error) {
      console.error("Error initializing data:", error)
      toast.error("Failed to initialize study stress features")
    } finally {
      setInitializing(false)
    }
  }

  const handleAddSession = async () => {
    if (!user || !date) return;
    
    try {
      // Create Date objects from the time strings
      const [startHours, startMinutes] = newSession.startTime.split(':').map(Number);
      const [endHours, endMinutes] = newSession.endTime.split(':').map(Number);
      
      const startTime = new Date(date);
      startTime.setHours(startHours, startMinutes, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const session = await studyStressService.createStudySession({
        userId: user.uid,
        subject: newSession.subject,
        startTime,
        endTime,
        notes: newSession.notes,
        status: "planned",
        date
      });

      setStudySessions([...studySessions, session]);
      setNewSession({
        subject: "",
        startTime: "",
        endTime: "",
        notes: ""
      });
      toast.success("Study session created successfully");
    } catch (error) {
      console.error('Error creating study session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create study session');
    }
  };

  const handleUpdateSession = async (sessionId: string, data: Partial<StudySession>) => {
    try {
      const updatedSession = await studyStressService.updateStudySession(sessionId, data);
      setStudySessions(prev => 
        prev.map(session => session.id === sessionId ? updatedSession : session)
      );
      toast.success("Study session updated successfully");
    } catch (error) {
      console.error('Error updating study session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update study session');
    }
  }

  // Handle breathing exercise
  const handleBreathingExercise = () => {
    if (!breathingActive) {
      setBreathingActive(true);
      setBreathingStep(0);
      setBreathingProgress(0);
      startBreathingCycle();
    } else {
      if (breathingInterval) {
        clearInterval(breathingInterval);
        setBreathingInterval(null);
      }
      setBreathingActive(false);
      setBreathingStep(0);
      setBreathingProgress(0);
    }
  };

  const startBreathingCycle = () => {
    if (!breathingActive) return;

    const step = breathingSteps[breathingStep];
    if (step.duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / step.duration) * 100, 100);
        setBreathingProgress(progress);
        
        if (elapsed >= step.duration) {
          clearInterval(interval);
          setBreathingInterval(null);
          if (breathingActive) {
            setBreathingStep((prev) => {
              const nextStep = prev + 1;
              if (nextStep >= breathingSteps.length) {
                setBreathingActive(false);
                setBreathingProgress(0);
                toast.success("Breathing exercise completed. Take a moment to notice how you feel.");
                return 0;
              }
              startBreathingCycle();
              return nextStep;
            });
          }
        }
      }, 50); // Update more frequently for smoother progress
      setBreathingInterval(interval);
    }
  };

  // Handle Pomodoro timer
  const handlePomodoroTimer = () => {
    if (!pomodoroActive) {
      setPomodoroActive(true);
      setIsBreak(false);
      setPomodoroTime(pomodoroSettings.workTime * 60);
      startPomodoroTimer();
    } else {
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
        setPomodoroInterval(null);
      }
      setPomodoroActive(false);
      setPomodoroTime(pomodoroSettings.workTime * 60);
      setIsBreak(false);
      setPomodoroSessionCount(1);
    }
  };

  const startPomodoroTimer = () => {
    if (!pomodoroActive) return;

    const startTime = Date.now();
    const totalSeconds = isBreak 
      ? (pomodoroSettings[isBreak ? 'longBreak' : 'shortBreak'] * 60)
      : (pomodoroSettings.workTime * 60);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(totalSeconds - Math.floor(elapsed / 1000), 0);
      
      setPomodoroTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setPomodoroInterval(null);
        if (isBreak) {
          // Break is over, start work session
          setIsBreak(false);
          setPomodoroTime(pomodoroSettings.workTime * 60);
          toast.success("Break is over! Time to focus.");
          startPomodoroTimer();
        } else {
          // Work session is over, start break
          setIsBreak(true);
          const isLongBreak = pomodoroSessionCount % pomodoroSettings.sessionsUntilLongBreak === 0;
          setPomodoroTime((isLongBreak ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak) * 60);
          toast.success(isLongBreak ? "Time for a long break!" : "Time for a short break!");
          setPomodoroSessionCount((prev) => prev + 1);
          startPomodoroTimer();
        }
      }
    }, 100); // Update more frequently for smoother progress
    setPomodoroInterval(interval);
  };

  // Handle break reminder
  const handleBreakReminder = () => {
    if (!breakReminderActive) {
      setBreakReminderActive(true);
      startBreakReminder();
    } else {
      if (breakReminderInterval) {
        clearInterval(breakReminderInterval);
        setBreakReminderInterval(null);
      }
      setBreakReminderActive(false);
    }
  };

  const startBreakReminder = () => {
    if (!breakReminderActive) return;

    const interval = setInterval(() => {
      toast.success("Break Time! Take a short break to stretch and refresh.");
    }, breakInterval * 60 * 1000);
    setBreakReminderInterval(interval);
  };

  // Cleanup all intervals when component unmounts
  useEffect(() => {
    return () => {
      if (breathingInterval) {
        clearInterval(breathingInterval);
      }
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
      }
      if (breakReminderInterval) {
        clearInterval(breakReminderInterval);
      }
    };
  }, []); // Only run on unmount

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Study Stress Management</h1>
        <p className="text-muted-foreground mt-2">Tools and resources to help you manage academic stress</p>
      </div>

      <Tabs defaultValue="planner" className="space-y-6">
        <TabsList>
          <TabsTrigger value="planner">Study Planner</TabsTrigger>
          <TabsTrigger value="techniques">Stress Reduction</TabsTrigger>
          <TabsTrigger value="resources">Exam Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Study Schedule</CardTitle>
                <CardDescription>Plan your study sessions and track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium">Add Study Session</h3>
                    <div className="grid gap-4">
                      <Input 
                        placeholder="Subject"
                        value={newSession.subject}
                        onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          type="time" 
                          placeholder="Start Time"
                          value={newSession.startTime}
                          onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                        />
                        <Input 
                          type="time" 
                          placeholder="End Time"
                          value={newSession.endTime}
                          onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                        />
                      </div>
                      <Textarea 
                        placeholder="Notes"
                        value={newSession.notes}
                        onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                      />
                      <Button onClick={handleAddSession}>Add Session</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>Your planned study sessions for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : studySessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No study sessions planned for today
                    </div>
                  ) : (
                    studySessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{session.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </p>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.status}</Badge>
                          {session.status === "planned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateSession(session.id, { status: "in-progress" })}
                            >
                              Start
                            </Button>
                          )}
                          {session.status === "in-progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateSession(session.id, { status: "completed" })}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="techniques" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Breathing Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Practice these breathing techniques before exams to reduce anxiety
                  </p>
                  {breathingActive ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {breathingSteps[breathingStep].text}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {breathingSteps[breathingStep].instruction}
                        </p>
                        <Progress 
                          value={breathingProgress} 
                          className="mt-4"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {Math.round((breathingSteps[breathingStep].duration - (breathingProgress / 100 * breathingSteps[breathingStep].duration)) / 1000)} seconds remaining
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleBreathingExercise}
                      >
                        Stop Exercise
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBreathingExercise}
                    >
                      Start Exercise
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use the Pomodoro technique to maintain focus and prevent burnout
                  </p>
                  {pomodoroActive ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-medium">
                          {formatTimer(pomodoroTime)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isBreak ? "Break Time" : `Session ${pomodoroSessionCount}`}
                        </p>
                        <Progress 
                          value={isBreak 
                            ? ((pomodoroSettings[isBreak ? 'longBreak' : 'shortBreak'] * 60 - pomodoroTime) / (pomodoroSettings[isBreak ? 'longBreak' : 'shortBreak'] * 60)) * 100
                            : ((pomodoroSettings.workTime * 60 - pomodoroTime) / (pomodoroSettings.workTime * 60)) * 100
                          } 
                          className="mt-4"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handlePomodoroTimer}
                      >
                        Stop Timer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Work Time (min)</label>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            value={pomodoroSettings.workTime}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              setPomodoroSettings(prev => ({
                                ...prev,
                                workTime: value
                              }));
                              setPomodoroTime(value * 60);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Short Break (min)</label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={pomodoroSettings.shortBreak}
                            onChange={(e) => setPomodoroSettings(prev => ({
                              ...prev,
                              shortBreak: Number(e.target.value)
                            }))}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handlePomodoroTimer}
                      >
                        Start Timer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Break Reminder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get reminded to take regular breaks during study sessions
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={breakInterval}
                      onChange={(e) => setBreakInterval(Number(e.target.value))}
                      disabled={breakReminderActive}
                    />
                    <p className="text-xs text-muted-foreground">
                      Break interval in minutes
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBreakReminder}
                  >
                    {breakReminderActive ? "Stop Reminder" : "Set Reminder"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam Preparation Tips</CardTitle>
                <CardDescription>Strategies for effective exam preparation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Before the Exam</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Create a study schedule</li>
                      <li>Review past exam papers</li>
                      <li>Join study groups</li>
                      <li>Practice time management</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">During the Exam</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Read instructions carefully</li>
                      <li>Manage your time effectively</li>
                      <li>Stay calm and focused</li>
                      <li>Review your answers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stress Management Resources</CardTitle>
                <CardDescription>Tools and techniques for managing exam stress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Stress Relief</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Deep breathing exercises</li>
                      <li>Progressive muscle relaxation</li>
                      <li>Mindfulness meditation</li>
                      <li>Physical exercise</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Long-term Strategies</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Regular sleep schedule</li>
                      <li>Healthy eating habits</li>
                      <li>Regular exercise routine</li>
                      <li>Time management skills</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 