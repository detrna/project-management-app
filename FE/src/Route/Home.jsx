import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import ProfileCard from "./Components/ProfileCard";
import styles from "./Home.module.css";

export default function Home() {
  const [users, setUsers] = useState(null);

  async function fetchProfileHome() {
    try {
      const res = await fetch("http://localhost:3000/fetchProfileHome");

      if (!res.ok) throw new Error("Couldn't fetch responses");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function searchProfile(e) {
    try {
      if (e.target.value === "") {
        fetchProfileHome();
        return;
      }
      const res = await fetch(
        `http://localhost:3000/searchProfile/${e.target.value}`,
      );
      if (!res.ok) throw new Error("Couldn't fetch responses");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchProfileHome();
  }, []);

  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <p id={styles.textUserlist}>Userlist</p>
          <input
            placeholder="search here ..."
            id={styles.input}
            onChange={searchProfile}
          ></input>
        </div>
        {users && (
          <div className={styles.userlist}>
            {users.map((u, index) => (
              <ProfileCard
                id={u.id}
                username={u.name}
                projectCount={u.projectCount}
                key={index}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
