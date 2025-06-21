import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie'

const apiUrl = import.meta.env.VITE_API_URL;

export const useUserMedications = (role: string, userId: string, date: string, isToday: boolean) => {
    const url = apiUrl + (isToday ? `/api/medications/?userId=${userId}` : `/api/medications/daily-status?userId=${userId}&date=${date}`)
    console.log(url)
    return useQuery({
      queryKey: ['user-medications'],
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
         refetchOnWindowFocus: false,
        //  staleTime: 1000 * 60 * 5 // 5 minutes
      });
};