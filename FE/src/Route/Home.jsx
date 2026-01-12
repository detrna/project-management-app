import Navbar from "./Components/Navbar";
import ProfileCard from "./Components/ProfileCard";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <p id={styles.textUserlist}>Userlist</p>
          <input placeholder="search here ..." id={styles.input}></input>
        </div>
        <div className={styles.userlist}>
          <ProfileCard></ProfileCard>
          <ProfileCard></ProfileCard>
          <ProfileCard></ProfileCard>
          <ProfileCard></ProfileCard>
          <ProfileCard></ProfileCard>
          <ProfileCard></ProfileCard>
        </div>
      </div>
    </>
  );
}
