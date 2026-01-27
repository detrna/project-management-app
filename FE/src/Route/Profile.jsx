import { Link, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ProjectCard from "./Components/ProjectCard";
import styles from "./Profile.module.css";
import imgAvatar from "./img/avatar.png";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";

export default function Profile() {
  const {id} = useParams()
  const {user} = useContext(AuthContext)

  const [profile, setProfile] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  

  async function fetchProfile(){
  try{
    const res = await fetch(`http://localhost:3000/fetchProfile/${id}`)
    if(!res.ok) throw new Error("Couldn't fetch responses")
    const data = await res.json()
    setProfile(data)
  } catch (err) {
    console.log(err)
  }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if(!profile || !user) return;
    if(user.id === profile.id) setIsOwner(true);

    console.log(isOwner)
  }, [profile])

  if(!profile) return (<></>)

  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userCard}>
            <img src={imgAvatar} id={styles.avatar} />
            <div className={styles.nameContainer}>
              <p id={styles.textName}>{profile.name}</p>
              <div className={styles.followerContainer}>
                <Link className={styles.link} to={"/follower"}>
                  <span id={styles.textFollower}>{profile.follower_count} Follower</span>
                </Link>
                <span id={styles.textFollower}> • </span>
                <Link className={styles.link} to={"/following"}>
                  <span id={styles.textFollower}>{profile.following_count} Following</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.projectContainer}>
          <div className={styles.projectHeader}>
            <div className={styles.projectTitle}>
              <h2 id={styles.textProject}>{profile.project_count} Projects</h2>
              <input id={styles.input} placeholder="search here..."></input>
            </div>
            {isOwner && 
            <div className={styles.newProjectContainer}>
              <Link to={"/create-project"}>
                <button id={styles.button}>New Project</button>
              </Link>
            </div>
            }
          </div>

          <div className={styles.projectList}>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
          </div>
        </div>
      </div>
    </>
  );
}
