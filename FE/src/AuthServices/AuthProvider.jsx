import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
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
      if (!res.ok) throw new Error("Couldn't fetch responses");
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchUser() {
    try {
      const res = await authFetch("http://localhost:3000/fetchProfile", "GET");

      if (!res.ok) throw new Error("Couldn't fetch responses");

      const data = await res.json();
      console.log(data);
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function authFetch(link, method) {
    try {
      let res = await fetch(link, {
        method: method,
        credentials: "include",
      });

      if (!res.ok) {
        return res;
      }
    } catch (err) {
      console.log(err);
    }

    if (res.statusCode === 401) {
      try {
        const refresh = await fetch("http://localhost:3000/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Couldn't fetch from refresh");
        }

        try {
          res = await fetch(link, {
            method: method,
            credentials: "include",
          });

          if (!res.ok) {
            return res;
          }

          return res;
        } catch (err) {
          return console.log(err);
        }
      } catch (err) {
        return console.log(err);
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}
