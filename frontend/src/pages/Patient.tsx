import Navbar from '@/components/Navbar'
import PatientDashboard from '@/components/PatientDashboard'
import { useVerify } from '@/hooks/useVerify';
import Loader from '@/components/Loader';
import ErrorFallback from '@/components/ErrorFallback';

const Patient = () => {

  
  const role = "patient";

  const {isLoading, error} = useVerify(role);

  if (error) {
    return <ErrorFallback />
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
          <PatientDashboard />
        </main>
      </div>
    );
}

export default Patient