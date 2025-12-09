import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'interviewer' | 'candidate' | 'employee' | 'admin' | string | string[] | null;
}

declare const ProtectedRoute: React.FC<ProtectedRouteProps>;
export default ProtectedRoute;
