import { Link, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ProjectCard from "./Components/ProjectCard";
import styles from "./Profile.module.css";
import imgAvatar from "./img/avatar.png";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";
import { fetchProfile } from "../Functions/fetchProfile";
import { followUser } from "../Functions/followUser";
import { unfollowUser } from "../Functions/unfollowUser";

export default function Profile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [follower, setFollower] = useState(0);

  async function fetchFollowerProfile() {
    try {
      const res = await fetch(`http://localhost:3000/follower/${id}`);
      if (!res.ok) throw new Error("Couldn't get responses");
      const data = await res.json();

      console.log(user.id, data);

      for (let i = 0; i < data.length; i++) {
        if (user.id === data[i].follower_id) {
          setIsFollowed(true);
          return;
        }
      }

      setIsFollowed(false);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(
    () => async () => {
      const data = await fetchProfile(id);
      setProfile(data);
      setFollower(data.follower_count);
    },
    [],
  );

  useEffect(() => {
    if (!profile || !user) return;
    if (user.id === profile.id) setIsOwner(true);
    fetchFollowerProfile();
  }, [profile]);

  async function handelFollowButton() {
    const isSuccess = isFollowed
      ? await handleUnfollowUser()
      : await handleFollowUser();

    if (isSuccess) fetchFollowerProfile();
  }

  async function handleFollowUser() {
    const isSuccess = await followUser(id);
    if (!isSuccess) return false;
    const newFollowerCount = follower + 1;
    setFollower(newFollowerCount);
    return true;
  }

  async function handleUnfollowUser() {
    const isSuccess = await unfollowUser(id);
    if (!isSuccess) return false;
    const newFollowerCount = follower - 1;
    setFollower(newFollowerCount);
    return true;
  }

  const FollowButton = () => {
    if (isOwner || !user) return null;

    return (
      <button className={styles.followButton} onClick={handelFollowButton}>
        {isFollowed ? "Followed" : "Follow"}
      </button>
    );
  };

  if (!profile) return <></>;

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
                <Link className={styles.link} to={`/follower/${id}`}>
                  <span id={styles.textFollower}>{follower} Follower</span>
                </Link>
                <span id={styles.textFollower}> • </span>
                <Link className={styles.link} to={"/following"}>
                  <span id={styles.textFollower}>
                    {profile.following_count} Following
                  </span>
                </Link>
                <FollowButton />
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
            {isOwner && (
              <div className={styles.newProjectContainer}>
                <Link to={"/create-project"}>
                  <button className={styles.button}>New Project</button>
                </Link>
              </div>
            )}
          </div>

          <div className={styles.projectList}>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
          </div>
        </div>
      </div>
    </>
  );
}
