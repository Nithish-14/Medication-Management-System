import { useState, useEffect } from "react";
import Cookies from 'js-cookie'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, Image, User } from "lucide-react";
import MedicationTracker from "./MedicationTracker";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuth } from '../hooks/useAuth';
import { useUserMedications } from "@/hooks/useUserMedications";
import { useUserMonthlyLogs } from "@/hooks/useUserMonthlyLogs";
import Loader from "./Loader";
import ErrorFallback from "./ErrorFallback";

const apiUrl = import.meta.env.VITE_API_URL;
import { queryClient } from './../App';

const PatientDashboard = () => {
  const {role, userId} = useAuth();
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);
  const isSelectedDateTaken = takenDates.has(selectedDateStr);
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

    if (totalMedications.length === 0) return false;

    for (const i of totalMedications) {
      if (i.status === "not_taken") {
        return false;
      }
    }

    return true;
  }
  
  const handleMarkTaken = async (date: string, medicationId: number, imageFile?: File) => {
    // setTakenDates(prev => new Set(prev).add(date));
    try {
    const formData = new FormData();
    formData.append("medicationId", medicationId.toString());

   
    formData.append("date", date); // Format: YYYY-MM-DD
  

    if (imageFile) {
      formData.append("photo", imageFile);
    }

    const token = Cookies.get("patient_jwt");

    const res = await fetch(apiUrl + "/api/medications/mark", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to mark medication as taken");

    // 🔁 Invalidate React Query caches
    queryClient.invalidateQueries({ queryKey: ['user-medications'] });

    if (data.totalMedsTaken) {
      // ✅ Only refetch stats if all meds are taken
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    }

    
  } catch(err) {
    console.log("Error " + err.message)
  }
    
  };

  const getDayClassName = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isPast = isBefore(date, startOfDay(today));
    const isCurrentDay = isToday(date);
    const isTaken = takenDates.has(dateStr);
    
    let className = "";
    
    if (isCurrentDay) {
      className += " bg-blue-100 border-blue-300 ";
    }
    
    if (isTaken) {
      className += " bg-green-100 text-green-800 ";
    } else if (isPast) {
      className += " bg-red-50 text-red-600 ";
    }
    
    return className;
  };

  const renderStats = () => (
    <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}! {userStats.username}</h2>
            <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{findTodaysStatus() ? "✓" : "○"}</div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{userStats.monthlyRate}%</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>
  )

  const renderTodaysMedication = () => (
    <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {isTodaySelected ? "Today's Medication" : `Medication for ${format(selectedDate, 'MMMM d, yyyy')}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
            {userMedications.medications.length === 0 ? (<h1 className="text-center">No Medications</h1>) : 
             (
              <>
                 {userMedications.medications.map((med, index) => (
              <MedicationTracker 
                  key={index}
                  medicationNo={index}
                  onMarkTaken={handleMarkTaken}
                  medication={med}
                  date={selectedDateStr}
                  isToday={isTodaySelected}
                />
            ))}
              </>
             )
            }
            {findTodaysStatus() &&
               <div className="flex items-center justify-center p-8 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Medication Completed!
            </h3>
            <p className="text-green-600">
              Great job! You've taken your medication for {format(new Date(userMedications.date), 'MMMM d, yyyy')}.
            </p>
          </div>
        </div>
            }
            </CardContent>
          </Card>
    </div>
  )

   if (statsError || medicationError || logError) {
    return <ErrorFallback />
  }
  

  const renderCalender = () => {
  return (<div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Medication Calendar</CardTitle>
              </CardHeader>
              <CardContent>
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
                      const isPast = isBefore(date, startOfDay(today));
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
              </CardContent>
            </Card>
          </div>)
    }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      {isStatLoading || isMedicationsLoading ? (
        <div className="min-h-[80vh flex items-center justify-center">
        <Loader />
        </div>
      ) : (
          <>
          {renderStats()}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Medication */}
            {renderTodaysMedication()}
            
            {/* Calendar */}
            {isCLoading ? (
              <Card className="flex items-start pt-52 justify-center">
              <Loader />
              </Card>
            ) : renderCalender()}
          </div>
          </>
      )}
    </div>
  );
};

export default PatientDashboard;
