import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';


export const ProtectedRoute = ({ 
  authType,
  children,
  redirectPath
}: {
  authType: 'admin' | 'user';
  children?: React.ReactNode;
  redirectPath?: string;
}) => {
  const isAuthenticated = useSelector((state: RootState) => 
    authType === 'admin' 
      ? Boolean(state.admin.admin) 
      : Boolean(state.user.User)
  );
  
  const defaultRedirectPath = authType === 'admin' ? '/admin/login' : '/auth';

  if (!isAuthenticated) {
    return <Navigate to={redirectPath || defaultRedirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};