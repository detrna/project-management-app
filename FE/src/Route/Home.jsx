import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import ProfileCard from "./Components/ProfileCard";
import styles from "./Home.module.css";

export default function Home() {
  const [users, setUsers] = useState(null);
  const [searchedUsers, setSearchedUsers] = useState(null);

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

  /* Backend-fetch search
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
  */

  function searchUser(event) {
    if (event.target.value === "") {
      setSearchedUsers(null);
      return;
    }
    const userFiltered = users.filter((user) => {
      return user.name.toLowerCase().includes(event.target.value.toLowerCase());
    });
    setSearchedUsers(userFiltered);
  }

  useEffect(() => {
    fetchProfileHome();
  }, []);

  const Userlist = () => {
    if (searchedUsers) {
      return (
        <div className={styles.userlist}>
          {searchedUsers.map((u, index) => (
            <ProfileCard
              id={u.id}
              username={u.name}
              projectCount={u.project_count}
              key={index}
            />
          ))}
        </div>
      );
    } else if (users) {
      return (
        <div className={styles.userlist}>
          {users.map((u, index) => (
            <ProfileCard
              id={u.id}
              username={u.name}
              projectCount={u.project_count}
              key={index}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <p id={styles.textUserlist}>Userlist</p>
          <input
            placeholder="search here ..."
            id={styles.input}
            onChange={(e) => searchUser(e)}
          ></input>
        </div>
        <Userlist />
      </div>
    </>
  );
}
