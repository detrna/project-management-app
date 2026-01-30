import { useState } from "react";
import Navbar from "./Components/Navbar";
import styles from "./Register.module.css";
import { useContext } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";

import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notMatch, setNotMatch] = useState(false);
  const [nameTaken, setNameTaken] = useState(false);
  const [emptyName, setEmptyName] = useState(false);
  const [emptyPassword, setEmptyPassowrd] = useState(false);

  const { registerUser, user } = useContext(AuthContext);

  const navigate = useNavigate();

  function verification() {
    if (name === "") {
      setEmptyName(true);
      return;
    }
    if (password === "") {
      setEmptyPassowrd(true);
      return;
    }

    if (password !== confirmPassword) {
      console.log(password, confirmPassword);
      setNotMatch(true);
      console.log("Wrong pw");
      return false;
    }
    setNotMatch(false);
    return true;
  }

  async function handleRegister() {
    setNameTaken(false);
    if (!verification()) return;
    const res = await registerUser({
      name: name,
      password: password,
    });

    if (res.status === 409) {
      setNameTaken(true);
      return;
    }

    navigate("/");
  }

  if (user) {
    navigate("/");
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
            {emptyName && (
              <h3 className={styles.alertMessage}>username can't be empty</h3>
            )}
            {nameTaken && (
              <h3 className={styles.alertMessage}>
                username was already taken
              </h3>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="password..."
              required
            />
            {emptyPassword && (
              <h3 className={styles.alertMessage}>password can't be empty</h3>
            )}
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
