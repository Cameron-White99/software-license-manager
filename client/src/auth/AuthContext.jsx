
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user after page refresh.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem('token');

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await api('/api/auth/me');

        if (active) {
          setUser(response.user ?? response.data ?? response);
        }
      } catch (error) {
        localStorage.removeItem('token');

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Log in and store the JWT token.
  async function login(email, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    localStorage.setItem('token', data.token);
    setUser(data.user);

    return data.user;
  }

  // Register and authenticate a new user.
  async function register(body) {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body
    });

    localStorage.setItem('token', data.token);
    setUser(data.user);

    return data.user;
  }

  // End the current session.
  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
