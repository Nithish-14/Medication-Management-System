import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie'

const apiUrl = import.meta.env.VITE_API_URL;

export const useUserMonthlyLogs = (role: string, userId: string, month: string) => {
    const url = apiUrl + `/api/medications/calendar/monthly?userId=${userId}&month=${month}`
    console.log(url)
    return useQuery({
      queryKey: ['user-monthly-logs'],
      queryFn: async () => {
        const token = Cookies.get(role + "_jwt")
        const res = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user stats");
        return data;
        },
         refetchOnWindowFocus: false,  // disable auto refetch on focus
        //  staleTime: 1000 * 60 * 5 // 5 minutes
      });
};