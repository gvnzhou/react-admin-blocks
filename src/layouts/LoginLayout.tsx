import { Outlet } from 'react-router-dom';

const LoginLayout = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Outlet />
    </div>
  );
};

export default LoginLayout;
