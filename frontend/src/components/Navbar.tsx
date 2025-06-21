import { Button } from './ui/button'
import { Users, User } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const {role} = useAuth();

  const switchUserType = () => {
      // setRole(role === "patient" ? "caretaker" : "patient")
      navigate(role === "patient" ? "/caretaker-patients" : "/patient-dashboard");
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MediCare Companion</h1>
              <p className="text-sm text-muted-foreground">
                {role === "patient" ? "Patient View" : "Caretaker View"}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={switchUserType}
            className="flex items-center gap-2 hover:bg-accent transition-colors"
          >
            {role === "patient" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            Switch to {role === "patient" ? "Caretaker" : "Patient"}
          </Button>
        </div>
      </header>
  )
}

export default Navbar