import { useState } from "react";
import Navbar from "./Components/Navbar";
import styles from "./Register.module.css";
import { useContext } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notMatch, setNotMatch] = useState(false);

  const { registerUser } = useContext(AuthContext);

  function verification() {
    if (password !== confirmPassword) {
      console.log(password, confirmPassword);
      setNotMatch(true);
      console.log("Wrong pw");
      return false;
    }
    setNotMatch(false);
    return true;
  }

  function handleRegister() {
    if (!verification()) return;
    registerUser({
      name: name,
      password: password,
    });
  }

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Register</h1>
          </div>
          <div className={styles.inputSection}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="username..."
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="password..."
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="confirm password..."
              required
            />
            {notMatch && <h2>Password didn't match</h2>}
            <button id={styles.button} onClick={handleRegister}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
