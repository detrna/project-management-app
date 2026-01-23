import Navbar from "./Components/Navbar";
import styles from "./Login.module.css";

export default function Login() {
  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Login</h1>
          </div>
          <div className={styles.inputSection}>
            <input className={styles.input} placeholder="username..."></input>
            <input className={styles.input} placeholder="password..."></input>
            <button id={styles.button}>Submit</button>
          </div>
        </div>
      </div>
    </>
  );
}
