import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner';
import AuthProvider from './contexts/AuthContext';
import Navigation from './navigation';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Navigation />
        <Toaster />
        <StatusBar />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
