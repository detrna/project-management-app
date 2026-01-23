import { Link } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./Collaborator.module.css";
import avatar from "./img/avatar.png";
import CollaboratorCard from "./Components/collaboratorCard";

export default function Collaborator() {
  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Project Collaborator</h1>
            <Link className={styles.link} to={"/project"}>
              <button id={styles.backButton}>Back</button>
            </Link>
          </div>
          <div className={styles.userSection}>
            <CollaboratorCard
              username={"username"}
              roleName={"Co-Owner"}
            ></CollaboratorCard>
            <CollaboratorCard
              username={"username"}
              roleName={"Back-End Devevloper"}
            ></CollaboratorCard>
          </div>
        </div>
      </div>
    </>
  );
}
