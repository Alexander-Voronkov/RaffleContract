import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Suspense, memo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { routes } from '../router';
import { Button, LinearProgress } from '@mui/material';
import { BalanceDisplay } from '../components/BalanceDisplay';

const DefaultLayout = memo(() => {
  const { status } = useAppKitAccount();

  const location = useLocation();
  const { disconnect } = useDisconnect();

  return (
    <div className="font-quicksand relative h-full">
      {status === 'connected' ? 
        <div className="flex justify-between align-center w-full" style={{position: 'absolute'}}>
            <Button onClick={() => disconnect()}>
                Logout
            </Button> 
            <BalanceDisplay></BalanceDisplay>
        </div>
        : <></>}
    
      <Suspense fallback={<LinearProgress />}>
        {status === 'connected' || location.pathname.endsWith(routes.login) ? (
          <Outlet />
        ) : (
          <Navigate to={routes.login} replace />
        )}
      </Suspense>
    </div>
  );
});
DefaultLayout.displayName = 'DefaultLayout';

export default DefaultLayout;