import Navbar from '@/components/Navbar'
import CaretakerDashboard from '@/components/CaretakerDashboard'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import { useVerifyUser } from '@/hooks/useVerifyUser';

const CareTaker = () => {    
    const role = "caretaker";
    
    const {userId} = useParams();
    const navigate = useNavigate();

    const {isLoading, error} = useVerifyUser(role, userId);

    if (error) {
      navigate("/caretaker-patients");
      return;
    }
  
  
    if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center border border-red-600">
         <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
          <CaretakerDashboard />
      </main>
    </div>
  )
}

export default CareTaker