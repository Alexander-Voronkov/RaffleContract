import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { wagmiAdapter } from '../lib/wagmi-config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const queryClient = new QueryClient();

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default Providers;