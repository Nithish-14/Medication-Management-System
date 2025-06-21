import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

const fetchPatients = async () => {
  const token = Cookies.get("caretaker_jwt");

  const res = await fetch(`${apiUrl}/api/medications/caretaker/patients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch patients");
  return data;
};

export const useCaretakerPatients = () => {
  return useQuery({
    queryKey: ['caretaker-patients'],
    queryFn: fetchPatients,
  });
};
