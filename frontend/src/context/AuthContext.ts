import { createContext } from "react";

type Role = "patient" | "caretaker" | null;

export interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);