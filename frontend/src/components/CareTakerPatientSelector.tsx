import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCaretakerPatients } from "@/hooks/useCaretakerPatients"; // 👈 your custom query
import Loader from "@/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import ErrorFallback from "./ErrorFallback";

const CaretakerPatientSelector = () => {
  const navigate = useNavigate();
  const {setUserId} = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patients, isLoading, isError } = useCaretakerPatients();

  const handleSelect = () => {
    if (selectedPatientId) {
      setUserId(selectedPatientId);
      navigate(`/caretaker-dashboard/${selectedPatientId}`);
    } else navigate("/auth");
  };

  if (isError) return <ErrorFallback />;
  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loader /></div>;
  
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl">Select a Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient: any) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPatientId === patient.id ? "bg-blue-100 border-blue-500" : ""
              }`}
            >
              <h3 className="text-lg font-medium">{patient.username}</h3>
              <p className="text-sm text-muted-foreground">{patient.email}</p>
            </div>
          ))}
          <Button className="mt-4 w-full" disabled={!selectedPatientId} onClick={handleSelect}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaretakerPatientSelector;
