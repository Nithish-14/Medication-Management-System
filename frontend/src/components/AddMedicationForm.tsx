import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useParams } from "react-router-dom";

interface MedicationDataType {
  userId: number;
  name: string;
  frequency: string;
  dosage: string;
}

interface Props {
  onSubmit: (data: MedicationDataType) => void;
  onClose: () => void;
}

const AddMedicationForm = ({ onSubmit, onClose }: Props) => {
  const { userId } = useParams();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Once a day");
  const [dosage, setDosage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; dosage?: string }>({});

  const id = parseInt(userId || "", 10);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Medication name is required";
    if (!dosage.trim()) errs.dosage = "Dosage is required";
    return errs;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data: MedicationDataType = {
      userId: id,
      name,
      dosage,
      frequency,
    };

    onSubmit(data);
    onClose(); // close modal
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Medication Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Paracetamol"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <div>
        <Label>Dosage</Label>
        <Input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="500mg"
        />
        {errors.dosage && <p className="text-sm text-red-500">{errors.dosage}</p>}
      </div>
      <div>
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={(value) => setFrequency(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Once a day">Once a day</SelectItem>
            <SelectItem value="Twice a day">Twice a day</SelectItem>
            <SelectItem value="Thrice a day">Thrice a day</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={handleSubmit}>Add</Button>
      </div>
    </div>
  );
};

export default AddMedicationForm;
