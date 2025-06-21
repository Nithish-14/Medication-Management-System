import Cookies from 'js-cookie'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  page: "patient" | "caretaker";
  children: JSX.Element;
}

const ProtectedRoute = ({ page, children }: ProtectedRouteProps) => {
  if (Cookies.get(page + "_jwt") === undefined) {
    return <Navigate to="/auth" replace />;
  } 
  return children
}

export default ProtectedRoute