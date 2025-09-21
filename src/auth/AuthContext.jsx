import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const DEMO_USERS = [
  { id: 1, email: "admin@emc.uz",  password: "123456", fullName: "Admin", role: "admin" },
  { id: 2, email: "rahbar@emc.uz", password: "123456", fullName: "Rahbar", role: "manager" },
  { id: 3, email: "xodim@emc.uz",  password: "123456", fullName: "Xodim",  role: "staff"  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = Cookies.get("emc_auth");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  const login = async (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Login yoki parol xato");
    const safe = { id: found.id, email: found.email, fullName: found.fullName, role: found.role };
    Cookies.set("emc_auth", JSON.stringify(safe), { expires: 7 });
    setUser(safe);
    return safe;
  };

  const logout = () => {
    Cookies.remove("emc_auth");
    setUser(null);
  };

  const createUser = ({ email, fullName, role }) => {
    const list = JSON.parse(localStorage.getItem("emc_users") || "[]");
    list.push({ id: Date.now(), email, fullName, role });
    localStorage.setItem("emc_users", JSON.stringify(list));
  };

  const value = { user, login, logout, createUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
