import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './AuthContext';
import RootNavigator from './RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#08090B" />
      <RootNavigator />
    </AuthProvider>
  );
}
