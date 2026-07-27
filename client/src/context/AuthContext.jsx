import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Client-side Database Helper
function getStoredUsers() {
  try {
    const raw = localStorage.getItem('atlas_db_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem('atlas_db_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atlas_user'));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    
    let existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      // Create user record dynamically on login
      existing = {
        id: Date.now(),
        name: email ? email.split('@')[0].toUpperCase() : 'AMIT SHARMA',
        email: email || 'executive@amex.com',
        cardType: 'Platinum Business',
        tier: 'Platinum Member',
        created_at: new Date().toISOString()
      };
      users.push(existing);
      saveStoredUsers(users);
    }

    const token = 'atlas_jwt_' + Date.now();
    localStorage.setItem('atlas_token', token);
    localStorage.setItem('atlas_user', JSON.stringify(existing));
    setUser(existing);
    return existing;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || (email ? email.split('@')[0] : 'EXECUTIVE USER')).trim();

    let existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      existing = {
        id: Date.now(),
        name: cleanName,
        email: email || 'executive@amex.com',
        cardType: 'Platinum Business',
        tier: 'Platinum Member',
        created_at: new Date().toISOString()
      };
      users.push(existing);
      saveStoredUsers(users);
    } else {
      existing.name = cleanName;
      saveStoredUsers(users);
    }

    const token = 'atlas_jwt_' + Date.now();
    localStorage.setItem('atlas_token', token);
    localStorage.setItem('atlas_user', JSON.stringify(existing));
    setUser(existing);
    return existing;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('atlas_token');
    localStorage.removeItem('atlas_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

