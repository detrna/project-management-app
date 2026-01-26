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
      if(res.statusCode === 401) return false;
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
      console.log(data);
      return true;
    } catch (err) {
      
      console.log(err);
      return false;
    }
  }

  async function logOut(){
    try{
      const res = await authFetch("/logout", "DELETE")

      if(!res.ok) throw new Error("Coudln't fetch from /logout")

      const data = await res.json()
      setUser(null)
      console.log(data)
    } catch(err){
      console.log(err)
    }
  }

  async function fetchUser() {
    try {
      const res = await authFetch("/fetchProfile", "GET");
      console.log("auth fetched /fetchProile")

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

  async function authFetch(endpoint, method) {
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: method,
        credentials: "include",
      });

      if (!res.ok) {
        return res;
      }

      if(res.statusCode !== 401 || 403) return res;

      const refresh = await fetch("http://localhost:3000/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refresh.ok) {
          throw new Error("Couldn't fetch from refresh");
        }
       
          return fetch(`http://localhost:3000${endpoint}`, {
            method: method,
            credentials: "include",
          });

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, registerUser, loginUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
