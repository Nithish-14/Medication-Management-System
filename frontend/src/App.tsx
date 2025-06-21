import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Index from "./pages/Index";
import Authentication from "./pages/Authentication";
import NotFound from "./pages/NotFound";
import { AuthContext } from "./context/AuthContext";
import Patient from './pages/Patient'
import CareTaker from './pages/CareTaker'
import CareTakerPatients from "./pages/CareTakerPatients";

export const queryClient = new QueryClient();

type Role = "patient" | "caretaker" | null;

const App = () => {
    const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);

  return (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthContext.Provider value={{ role, setRole, userId, setUserId }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/patient-dashboard" element={<ProtectedRoute page="patient"><Patient /></ProtectedRoute>} />
          <Route path="/caretaker-patients/" element={<ProtectedRoute page="caretaker"><CareTakerPatients /></ProtectedRoute>} />
          <Route path="/caretaker-dashboard/:userId" element={<CareTaker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthContext.Provider>
    </TooltipProvider>
  </QueryClientProvider>)
};

export default App;
