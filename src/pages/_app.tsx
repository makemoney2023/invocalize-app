import type { AppProps } from 'next/app';
import { insertTestLead } from '@/utils/testUtils';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

if (typeof window !== 'undefined') {
  (window as any).insertTestLead = insertTestLead;
}
