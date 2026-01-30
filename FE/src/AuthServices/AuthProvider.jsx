import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { authFetch } from "../Functions/AuthFetch";
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function registerUser(formData) {
    try {
      const payload = { name: formData.name, password: formData.password };

      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.status === 409) return res;
      if (!res.ok) throw new Error("Couldn't fetch responses");
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function loginUser(formData) {
    try {
      const payload = { name: formData.name, password: formData.password };

      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Couldn't fetch responses");
      if (res.statusCode === 401) return false;
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function logOut() {
    try {
      const res = await authFetch("/logout", "DELETE");

      if (!res.ok) throw new Error("Coudln't fetch from /logout");

      const data = await res.json();
      setUser(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchUser() {
    try {
      const res = await authFetch("/fetchProfile", "GET");

      if (!res.ok) throw new Error("Couldn't fetch responses");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, registerUser, loginUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
