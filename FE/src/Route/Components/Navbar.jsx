import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../../AuthServices/AuthProvider";
import { useContext } from "react";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logOut } = useContext(AuthContext);
  const [profileMenu, setProfileMenu] = useState(false)

  async function log() {
    console.log(user);

    /*
    try {
      const res = await fetch("http://localhost:3000/log", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("error");

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
    */
  }

  function handleProfileButton(){
    console.log("test")
    if(profileMenu){
      setProfileMenu(false)
    } else {
      setProfileMenu(true)
    }
  }
  
      function handleLogout(){
          logOut()
          setProfileMenu(false)
          navigate("/")
      }

  return (
    <>
    <div className={styles.container}>
      <Link to={"/"} className={styles.link}>
        <p id={styles.p} className={styles.leftSide}>
          Project Management App
        </p>
      </Link>
      <button id={styles.button} onClick={log}></button>
      {!user ? (
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
          <p id={styles.p}>{user.name}</p>

          <i onClick={handleProfileButton} className="fa-solid fa-user" id={styles.icon}></i>
        </div>
      )}
    </div>
    {profileMenu && 
      <div className={styles.profileMenuContainer}>
        <ProfileMenu handleLogoutButton={handleLogout}></ProfileMenu>
      </div>
    }
    </>
  );
}
