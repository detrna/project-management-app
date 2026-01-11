import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ name }) {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className={styles.container}>
      <p className={styles.leftSide}>Project Management App</p>
      {!loggedIn ? (
        <div className={styles.rightSide}>
          <Link to={"/login"}>
            <button>Login</button>
          </Link>
          <Link to={"/register"}>
            <button>Register</button>
          </Link>
        </div>
      ) : (
        <div className={styles.rightSide}>
          <p>{name}</p>

          <i class="fa-solid fa-user"></i>
        </div>
      )}
    </div>
  );
}
