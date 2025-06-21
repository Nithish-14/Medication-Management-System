import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddMedicationForm from "./AddMedicationForm";
import Cookies from 'js-cookie';
import { queryClient } from "@/App"; // adjust path
const apiUrl = import.meta.env.VITE_API_URL;

const AddMedicationModal = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleAddMedication = async (formData) => {
    try {
      const token = Cookies.get("caretaker_jwt");

      const res = await fetch(`${apiUrl}/api/medications/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to add medication:", data.message);
      } else {
        console.log("Added successfully:", data);
        queryClient.invalidateQueries({ queryKey: ['user-medications'] });
        setDialogOpen(false);
      }
    } catch (err) {
      console.error("Error adding medication:", err.message);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto mb-4">Add Medication</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <AddMedicationForm
          onSubmit={handleAddMedication}
          onClose={() => setDialogOpen(false)} // ✅ close on cancel
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationModal;
