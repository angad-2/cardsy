import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/lib/api";

// Redirects to /auth when there's no stored token.
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
