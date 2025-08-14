'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Timer, ListChecks, Gauge, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type FocusSession = {
  startTime: string;
  endTime: string;
};

type FocusChartPoint = {
  label: string;
  focusMinutes: number;
};

type WorkingHour = {
  time: string;
  hours: number;
};

type Stats = {
  focusMinutes: number;
  sessionCount: number;
  avgFocus: number;
  avgBreak: number;
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('daily');
  const [workingHoursData, setWorkingHoursData] = useState<WorkingHour[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [dailyData, setDailyData] = useState<FocusChartPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<FocusChartPoint[]>([]);
  const [yearlyData, setYearlyData] = useState<FocusChartPoint[]>([]);
  const [statsData, setStatsData] = useState<Stats>({
    focusMinutes: 0,
    sessionCount: 0,
    avgFocus: 0,
    avgBreak: 0,
  });

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/session');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Check if API returned an error
        if (data.error) {
          console.error('API Error:', data.error);
          return;
        }

        // Safely set data with fallbacks
        const sessions = data.sessions || [];
        const dailyData = data.dailyData || [];
        const monthlyData = data.monthlyData || [];
        const yearlyData = data.yearlyData || [];
        const workingHoursData = data.workingHoursData || [];
        
        setSessions(sessions);
        setDailyData(dailyData);
        setMonthlyData(monthlyData);
        setYearlyData(yearlyData);
        setWorkingHoursData(workingHoursData);

        // Stats calculation with safe data
        const sessionCount = sessions.length;
        const focusMinutes = sessions.reduce((sum: number, s: any) => {
          return sum + (s.duration ? s.duration / 60 : 0);
        }, 0);
        const avgFocus = sessionCount > 0 ? focusMinutes / sessionCount : 0;

        let totalBreakTime = 0;
        if (sessionCount > 1) {
          const sorted = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          for (let i = 1; i < sorted.length; i++) {
            const prevEnd = new Date(sorted[i - 1].endTime).getTime();
            const currStart = new Date(sorted[i].startTime).getTime();
            const gap = (currStart - prevEnd) / 1000 / 60;
            if (gap > 1 && gap < 60) totalBreakTime += gap;
          }
        }

        const avgBreak = sessionCount > 1 ? totalBreakTime / (sessionCount - 1) : 0;

        setStatsData({
          focusMinutes: Math.round(focusMinutes),
          sessionCount,
          avgFocus: Math.round(avgFocus),
          avgBreak: Math.round(avgBreak),
        });
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        // Set empty data on error
        setSessions([]);
        setDailyData([]);
        setMonthlyData([]);
        setYearlyData([]);
        setWorkingHoursData([]);
        setStatsData({
          focusMinutes: 0,
          sessionCount: 0,
          avgFocus: 0,
          avgBreak: 0,
        });
      }
    }

    fetchSessions();

    function handleSessionSaved(event: any) {
      fetchSessions(); // This will now also update working hours data
    }

    window.addEventListener('sessionSaved', handleSessionSaved);

    return () => {
      window.removeEventListener('sessionSaved', handleSessionSaved);
    };
  }, []);

  const selectedChartData = activeTab === 'daily' ? dailyData : activeTab === 'monthly' ? monthlyData : yearlyData;

  const stats = [
    {
      title: 'Focus Minutes',
      value: `${statsData.focusMinutes} min`,
      icon: <Timer className="w-5 h-5 text-muted-foreground" />, // Add actual color class
      color: 'text-green-600',
    },
    {
      title: 'Sessions',
      value: `${statsData.sessionCount}`,
      icon: <ListChecks className="w-5 h-5 text-muted-foreground" />, // Add actual color class
      color: 'text-blue-600',
    },
    {
      title: 'Avg. Focus/Session',
      value: `${statsData.avgFocus} min`,
      icon: <Gauge className="w-5 h-5 text-muted-foreground" />, // Add actual color class
      color: 'text-yellow-600',
    },
    {
      title: 'Avg. Break/Session',
      value: `${statsData.avgBreak} min`,
      icon: <Coffee className="w-5 h-5 text-muted-foreground" />, // Add actual color class
      color: 'text-red-600',
    },
  ];

  return (
    <div className="bg-[#0A0A23] min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
    key={stat.title}
    className={`rounded-2xl bg-white/[0.08] backdrop-blur-lg border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(96,165,250,0.2)] transition-all hover:scale-105 duration-300 ease-in-out flex flex-col items-center justify-center text-center py-6 px-4 min-h-[160px] hover:bg-white/[0.12] ${stat.color}`}
  >
           <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white/[0.15] backdrop-blur-sm border border-white/[0.2] shadow-lg">
  {stat.icon}
</div>
            <p className="text-sm text-gray-200">{stat.title}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-900 border border-gray-700 mb-4">
          <TabsTrigger
            value="daily"
            className="data-[state=active]:bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition"
          >
            Daily
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition"
          >
            Monthly
          </TabsTrigger>
          <TabsTrigger
            value="yearly"
            className="data-[state=active]:bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition"
          >
            Yearly
          </TabsTrigger>
        </TabsList>

        <div className="rounded-2xl border border-gray-700 bg-[#111132] p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Focus Time Overview</h2>

          <TabsContent value="daily">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <Tooltip />
                <Legend />
                <Bar dataKey="focusMinutes" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <Tooltip />
                <Legend />
                <Bar dataKey="focusMinutes" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yearly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <Tooltip />
                <Legend />
                <Bar dataKey="focusMinutes" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </div>
      </Tabs>

      <div className="mb-6">
        <Card className="bg-gradient-to-br from-[#0A0A23] to-[#1F1F3A] border border-[#2C2C4A] shadow-[0_0_20px_rgba(96,165,250,0.4)] rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-white">
              Working Hours (Today)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={workingHoursData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4D" />
                <XAxis dataKey="time" stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F1F3A",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#E2E8F0" }}
                  itemStyle={{ color: "#60A5FA" }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="url(#colorHours)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    stroke: "#60A5FA",
                    strokeWidth: 2,
                    fill: "#111132",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

