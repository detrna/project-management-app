import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ name }) {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className={styles.container}>
      <Link to={"/"} className={styles.link}>
        <p id={styles.p} className={styles.leftSide}>
          Project Management App
        </p>
      </Link>
      {!loggedIn ? (
        <div className={styles.rightSide}>
          <Link to={"/login"}>
            <button id={styles.button}>Login</button>
          </Link>
          <Link to={"/register"}>
            <button id={styles.button}>Register</button>
          </Link>
        </div>
      ) : (
        <div className={styles.rightSide}>
          <p id={styles.p}>{name}</p>

          <i class="fa-solid fa-user" id={styles.icon}></i>
        </div>
      )}
    </div>
  );
}
