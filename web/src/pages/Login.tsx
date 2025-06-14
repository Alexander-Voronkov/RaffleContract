import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Navigate } from 'react-router-dom';

import { routes } from '../router';
import { Button } from '@mui/material';

const LoginPage = () => {
  const { status } = useAppKitAccount();
  const { open } = useAppKit();

  return status === 'connected' ? (
    <Navigate to={routes.root} />
  ) : (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Button className="w-full h-full" variant="contained" onClick={() => open()}>ДЕПНУТЬ</Button>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://casinorange.com/wp-content/uploads/2024/4/The_Dog_House_Dog_or_Alive_Pragma.2e16d0ba.fill-600x340.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default LoginPage;