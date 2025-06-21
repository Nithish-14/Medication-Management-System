import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cookies from 'js-cookie'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Users, Bell, Calendar as CalendarIcon, Mail, AlertTriangle, Check, Clock, Camera, BriefcaseMedical } from "lucide-react";
import NotificationSettings from "./NotificationSettings";
import { format, subDays, isToday, isBefore, startOfDay, lastDayOfMonth, getDate } from "date-fns";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuth } from '../hooks/useAuth';
import { useUserMedications } from "@/hooks/useUserMedications";
import { useUserMonthlyLogs } from "@/hooks/useUserMonthlyLogs";
import Loader from "./Loader";
import { useParams } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const apiUrl = import.meta.env.VITE_API_URL;
import ErrorFallback from "./ErrorFallback";
import { queryClient } from './../App';
import AddMedicationModal from "./AddMedicationModal";


const CaretakerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const {role} = useAuth();
  const {userId} = useParams();
   const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
    const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);
  const [isCLoading, setLoading] = useState<boolean>(true);

  const {data: userStats, isLoading: isStatLoading, error: statsError} = useUserStats(role);

  const {data: userMedications, isLoading: isMedicationsLoading, error: medicationError} = useUserMedications(role, userId, selectedDateStr, todayStr === selectedDateStr)

  const {data: userCalender, isLoading: isCalenderLoading, error: logError} = useUserMonthlyLogs(role, userId, currentMonth);
    

  useEffect(() => {
    if (!isCalenderLoading && userCalender) {
      const taken = Object.entries(userCalender.days)
        .filter(([_, status]) => status === 'taken')
        .map(([day]) => `${currentMonth}-${day.padStart(2, '0')}`);

      setTakenDates(new Set(taken));
      setLoading(false);
    }
  }, [userCalender, isCalenderLoading, currentMonth]);


    const updateSelectedDate = (date) => {
        setSelectedDate(date);
        queryClient.invalidateQueries({ queryKey: ['user-medications'] });
      }
    
      const updateSelectedMonth = (monthDate) => {
       
        const month = format(monthDate, 'yyyy-MM');
        setCurrentMonth(month);
        queryClient.invalidateQueries({ queryKey: ['user-monthly-logs'] });
      }

      const findTodaysStatus = () => {
        const totalMedications = userMedications.medications;

        for (const i of totalMedications) {
          if (i.status === "not_taken") {
            return false;
          }
        }

        return true;
      }

      const missedThisMonth = () => {
      const data = userCalender;
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const [year, month] = data.month.split('-');

      let missedCount = 0;

      for (const [day, status] of Object.entries(data.days)) {
        const dateStr = `${data.month}-${day.padStart(2, '0')}`;

        const date = new Date(`${year}-${month}-${day}`);
        if (status === "not_taken" && date < today) {
          missedCount++;
        }
      }

      return missedCount;
      }

      const remainingDays = () => {
         const today = new Date();
          const lastDay = lastDayOfMonth(today); // returns Date object
          const remainingDays = getDate(lastDay) - getDate(today) + 1;
          return remainingDays;
      }

  

    useEffect(() => {
      const recentActivityFn = async() => {
        
        try {
          const res = await fetch(apiUrl + `/api/medications/recent?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("caretaker_jwt")}`
            }
          });
        
          if (res.ok) {
            const data = await res.json();
            
            setRecentActivity(data);
          }

        } catch(err) {
          console.log(err)
        }
      }
      recentActivityFn() 
    }, [])

    console.log("reccent", recentActivity)

  const handleSendReminderEmail = () => {
    console.log("Sending reminder email to patient...");
    // Here you would implement email sending functionality
    alert("Reminder email sent to " + userStats.username);
  };

  const addMedication = () => {

  }

  const handleConfigureNotifications = () => {
    setActiveTab("notifications");
  };

  const handleViewCalendar = () => {
    setActiveTab("calendar");
  };

  const renderStats = () => (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Caretaker Dashboard</h2>
            <p className="text-white/90 text-lg">Monitoring {userStats.username}'s medication adherence</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{userStats.adherenceRate}%</div>
            <div className="text-white/80">Adherence Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <div className="text-white/80">Current Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{missedThisMonth()}</div>
            <div className="text-white/80">Missed This Month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{userStats.takenThisWeek}</div>
            <div className="text-white/80">Taken This Week</div>
          </div>
        </div>
      </div>
  )

  if (statsError || medicationError || logError) {
      return <ErrorFallback />
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      {(isStatLoading || isMedicationsLoading || isCalenderLoading) ? (<Loader />) : (
        <>
        {renderStats()}
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    Today's Status
                  </CardTitle>
                </CardHeader>
                {userMedications.medications.length === 0 ? <h1 className="text-center">No Medications</h1> : (
                  <>
                    {userMedications.medications.map((med) => (
                  <CardContent key={med.id}>
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{med.name + " - " + med.dosage}</h4>
                      <p className="text-sm text-muted-foreground">{"8:00 AM"}</p>
                    </div>
                    <Badge variant={med.status === "not_taken" ? "destructive" : "secondary"}>
                      {med.status === "not_taken" ? "Pending" : "Completed"}
                    </Badge>
                  </div>
                </CardContent>
                ))
                }
                </>
                )}
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSendReminderEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reminder Email
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleConfigureNotifications}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Configure Notifications
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleViewCalendar}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Full Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
            <AddMedicationModal />
            {/* Adherence Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Adherence Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{userStats.adherenceRate}%</span>
                  </div>
                  <Progress value={userStats.adherenceRate} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-green-600">{takenDates.size}</div>
                      <div className="text-muted-foreground">Taken</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{missedThisMonth()} days</div>
                      <div className="text-muted-foreground">Missed</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">{remainingDays()} days</div>
                      <div className="text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Medication Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === "Completed" ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {activity.status === "Completed" ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {activity.date}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.status === "Completed" ? `Taken at ${activity.time}` : 'Medication missed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.photo !== null && (
                          <Badge variant="outline">
                            <Camera className="w-3 h-3 mr-1" />
                            Photo
                          </Badge>
                        )}
                        <Badge variant={activity.status === "Completed" ? "secondary" : "destructive"}>
                          {activity.status === "Completed" ? "Completed" : "Missed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medication Calendar Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && updateSelectedDate(date)}
                       onMonthChange={(monthDate) => updateSelectedMonth(monthDate)}
                      className="w-full"
                      modifiersClassNames={{
                        selected: "bg-blue-600 text-white hover:bg-blue-700",
                      }}
                      components={{
                        DayContent: ({ date }) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const isTaken = takenDates.has(dateStr);
                          const isPast = isBefore(date, startOfDay(new Date()));
                          const isCurrentDay = isToday(date);
                          
                          return (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <span>{date.getDate()}</span>
                              {isTaken && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                              {!isTaken && isPast && !isCurrentDay && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Medication taken</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span>Missed medication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>

                  <div> 
                    <h4 className="font-medium mb-4">
                      Details for {format(selectedDate, 'MMMM d, yyyy')}
                    </h4>
                    
                    <div className="space-y-4">
                      {takenDates.has(format(selectedDate, 'yyyy-MM-dd')) ? (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Medication Taken</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {userStats.username} successfully took their medication on this day.
                          </p>
                        </div>
                      ) : isBefore(selectedDate, startOfDay(new Date())) ? (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">Medication Missed</span>
                          </div>
                          <p className="text-sm text-red-700">
                            {userStats.username} did not take their medication on this day.
                          </p>
                        </div>
                      ) : isToday(selectedDate) ? (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-800">Today</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Monitor {userStats.username}'s medication status for today.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-800">Future Date</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            This date is in the future.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings email={userStats.email} username={userStats.username} rate={userStats.adherenceRate} streak={userStats.currentStreak} />
          </TabsContent>
        </Tabs>
        </>
      )}
      


    </div>
  );
};

export default CaretakerDashboard;
