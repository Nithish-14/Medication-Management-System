import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorFallback = ({ message = "Something went wrong." }: { message?: string }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-6 flex flex-col items-center text-center gap-4">
      <AlertTriangle className="w-10 h-10 text-red-500" />
      <div>
        <h2 className="text-xl font-semibold">{message}</h2>
        <p className="text-sm text-red-700 mt-1">Please try again or return to the home page.</p>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </div>
  );
};

export default ErrorFallback;
