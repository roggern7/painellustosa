import { useState, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Since we use a hardcoded token, admin is always "logged in"
  const [isAdmin] = useState(true);
  const [loading] = useState(false);

  const signIn = () => {};
  const signOut = () => {};

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
