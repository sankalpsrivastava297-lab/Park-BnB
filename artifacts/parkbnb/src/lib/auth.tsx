import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGetMe } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react/src/custom-fetch';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('userId'));

  // The custom fetch configuration needs a way to pass the mock header
  // Actually, since we only have setAuthTokenGetter which uses Bearer token,
  // let's just make the custom fetch append a header. Wait, we can't easily edit custom fetch
  // to add x-user-id if it's not supported by default, but we can override the global fetch 
  // or use the auth token getter to pass the user ID as a token, but the backend expects x-user-id?
  // Let's assume the backend takes x-user-id or we just pass the user id around.
  // Actually, looking at the api spec in custom-fetch, there is no automatic x-user-id.
  // We'll intercept fetch if necessary, but Orval hooks have request init.
  // Wait, the API spec says `useGetMe` uses `/api/users/me`.
  // We will just patch window.fetch to always include x-user-id if it exists.
  
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      if (userId) {
        config = config || {};
        config.headers = {
          ...config.headers,
          'x-user-id': userId
        };
      }
      return originalFetch(resource, config);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [userId]);

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!userId,
      retry: false
    }
  });

  const login = (id: string) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isLoading && !!userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
