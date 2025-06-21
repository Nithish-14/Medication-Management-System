import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie'
import { useAuth } from './useAuth';

const apiUrl = import.meta.env.VITE_API_URL;

export const useVerify = (role: string) => {
  const {setRole, setUserId} = useAuth();
  return useQuery({
    queryKey: ['user-verify'],
    queryFn: async () => {
      const token = Cookies.get(role + "_jwt")
      
      console.log(apiUrl + `/api/auth/verify`)
      const res = await fetch(apiUrl + `/api/auth/verify`, {
          headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      const data = await res.json();
      setRole(data.role);
      setUserId(data.id);
      if (!res.ok) throw new Error(data.message || "Failed to fetch user stats");
      return data;
      },
      refetchOnWindowFocus: false,  // disable auto refetch on focus
    });
};