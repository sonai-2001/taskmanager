'use client';

import { AppStore, makeStore } from '@/redux-toolkit/store/store';
import { useRef } from 'react';
import { Provider } from 'react-redux';

export default function ReduxStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize useRef with null and type it correctly to AppStore | null
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
