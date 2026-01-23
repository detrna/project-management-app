import { Link } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./Follower.module.css";
import avatar from "./img/avatar.png";

export default function Follower() {
  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Follower</h1>
            <Link
              className={styles.link}
              id={styles.buttonLink}
              to={"/profile"}
            >
              <button id={styles.backButton}>Back</button>
            </Link>
          </div>
          <div className={styles.followerSection}>
            <div className={styles.followerCard}>
              <Link className={styles.link} to={"/profile"}>
                <div className={styles.credentials}>
                  <img src={avatar} id={styles.avatar}></img>
                  <p id={styles.textUsername}>username</p>
                </div>
              </Link>
              <div>
                <button id={styles.followButton}>Follow</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
