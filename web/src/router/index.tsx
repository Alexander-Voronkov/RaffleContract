import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithRetry(dynamicImportFn: () => any) {
  return lazy(() =>
    dynamicImportFn().catch(() => {
      window.location.reload();
    }),
  );
}

export const routes = {
  root: '/',
  login: '/login',
} as const;

export const router = createBrowserRouter([
  {
    path: routes.root,
    Component: DefaultLayout,
    children: [
      {
        path: routes.login,
        Component: lazyWithRetry(() => import('../pages/Login')),
      },
      {
        path: routes.root,
        Component: lazyWithRetry(() => import('../pages/Home')),
      },
      {
        path: '*',
        element: <Navigate to={routes.root} />,
      },
    ],
  },
]);