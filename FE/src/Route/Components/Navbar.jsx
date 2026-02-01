import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../../AuthServices/AuthProvider";
import { useContext } from "react";
import ProfileMenu from "./ProfileMenu";
import MailMenu from "./MailMenu";
import { authFetch } from "../../Functions/AuthFetch";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logOut } = useContext(AuthContext);
  const [profileMenu, setProfileMenu] = useState(false);
  const [mailMenu, setMailMenu] = useState(false);
  const [mails, setMails] = useState(null);

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

  function handleIconButton() {
    setProfileMenu(profileMenu ? false : true);
    profileMenu || setMailMenu(false);
  }

  function handleMailButton() {
    setMailMenu(mailMenu ? false : true);
    mailMenu || setProfileMenu(false);
  }

  useEffect(
    () => async () => {
      if (!mailMenu) return;
      const newMail = await fetchMail();
      setMails(newMail);
    },
    [mailMenu],
  );

  function handleLogout() {
    logOut();
    setProfileMenu(false);
    navigate("/");
  }

  function handleProfile() {
    navigate(`/profile/${user.id}`);
  }

  async function fetchMail() {
    try {
      console.log("Fetching Mail");
      const res = await authFetch(`/mail`);
      if (!res.ok) throw new Error("Couldn't get responses from mail");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  async function setMileOnLoad() {
    if (user && !mails) setMails(await fetchMail());
  }

  async function updateMail() {
    console.log("UPDATING MAIL");
    const newMails = await fetchMail();
    setMails(newMails);
  }

  setMileOnLoad();

  return (
    <>
      <div className={styles.container}>
        <Link to={"/"} className={styles.link}>
          <p className={`${styles.leftSide} ${styles.p}`}>
            Project Management App
          </p>
        </Link>
        {!user ? (
          <div className={styles.rightSide}>
            <Link to={"/login"}>
              <button className={styles.button}>Login</button>
            </Link>
            <Link to={"/register"}>
              <button className={styles.button}>Register</button>
            </Link>
          </div>
        ) : (
          <div className={styles.rightSide}>
            <p className={styles.p}>{user.name}</p>
            <i
              className={`${styles.icon} fa-solid fa-envelope`}
              onClick={handleMailButton}
            ></i>
            <i
              onClick={handleIconButton}
              className={`${styles.icon} fa-solid fa-user`}
            ></i>
          </div>
        )}
      </div>
      {profileMenu && (
        <div className={styles.profileMenuContainer}>
          <ProfileMenu
            handleProfileButton={handleProfile}
            handleLogoutButton={handleLogout}
          ></ProfileMenu>
        </div>
      )}
      {mailMenu && (
        <div className={styles.mailMenuContainer}>
          <MailMenu mail={mails} updateMail={updateMail} />
        </div>
      )}
    </>
  );
}
