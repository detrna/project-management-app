import Navbar from "./Components/Navbar";
import styles from "./Login.module.css";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthServices/AuthProvider";

export default function Login() {
  const navigate = useNavigate()

  const {user, loginUser} = useContext(AuthContext)

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loginFailed, setLoginFailed] = useState(false)

  function handleSubmitButton(){
    const isLoggedIn = loginUser({name: name, password: password});
    if(!isLoggedIn) {
      setLoginFailed(true);
      return;
    }
    console.log("hahayL ", isLoggedIn)
    navigate("/")
  }

  if(user){
    navigate("/")
  }

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Login</h1>
          </div>
          <div className={styles.inputSection}>
            <input className={styles.input} placeholder="username..." onChange={e => setName(e.target.value)}></input>
            <input className={styles.input} placeholder="password..." type="password" onChange={e => setPassword(e.target.value)}></input>
            {loginFailed && <h3>Incorrect username or password</h3>}
            <button id={styles.button} onClick={handleSubmitButton}>Submit</button>
          </div>
        </div>
      </div>
    </>
  );
}
