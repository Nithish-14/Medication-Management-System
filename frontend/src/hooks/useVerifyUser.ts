import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie'
import { useAuth } from './useAuth';

const apiUrl = import.meta.env.VITE_API_URL;

export const useVerifyUser = (role: string, userId: string) => {
  const {setRole, setUserId} = useAuth();
  return useQuery({
    queryKey: ['caretaker-user-verify'],
    queryFn: async () => {
      const token = Cookies.get(role + "_jwt")

      const res = await fetch(apiUrl + `/api/auth/verify/user?userId=${userId}`, {
          headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      const data = await res.json();
      setRole("caretaker");
      setUserId(data.userId);
      if (!res.ok) throw new Error(data.message || "Failed to fetch user stats");
      return data;
      },
      refetchOnWindowFocus: false,  // disable auto refetch on focus
    });
};