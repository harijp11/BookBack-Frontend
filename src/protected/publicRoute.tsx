import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store'; // Update this path to match your store location


export const PublicRoute = ({ 
    authType,
    children,
    redirectLoggedInTo
  }: {
    authType: 'admin' | 'user';
    children?: React.ReactNode;
    redirectLoggedInTo?: string;
  }) => {
   
    const isAuthenticated = useSelector((state: RootState) => 
      authType === 'admin' 
        ? Boolean(state.admin.admin) 
        : Boolean(state.user.User)
    );
    
  
    const defaultRedirectPath = authType === 'admin' ? '/admin/Dashboard' : '/';
  
   
    if (isAuthenticated) {
      return <Navigate to={redirectLoggedInTo || defaultRedirectPath} replace />;
    }
  
   
    return children ? <>{children}</> : <Outlet />;
  };