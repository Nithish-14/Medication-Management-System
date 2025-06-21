import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie'
import { format } from "date-fns";


const apiUrl = import.meta.env.VITE_API_URL;
import { useParams } from 'react-router-dom';

export const useUserStats = (role: string) => {
  const {userId} = useParams();
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const token = Cookies.get(role + "_jwt")
      const selectedDate = new Date();
      const monthParam = format(selectedDate, 'yyyy-MM');
      console.log(apiUrl + `/api/medications/stats?month=${monthParam}&userId=${userId}`)
      const res = await fetch(apiUrl + `/api/medications/stats?month=${monthParam}&userId=${userId}`, {
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