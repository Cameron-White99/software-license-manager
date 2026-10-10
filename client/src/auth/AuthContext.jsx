import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(body) {
    const data = await api('/api/auth/register', { method: 'POST', body });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}