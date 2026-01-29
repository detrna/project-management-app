import { Link, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./Follower.module.css";
import avatar from "./img/avatar.png";
import FollowerCard from "./Components/FollowerCard";
import { useContext, useEffect, useState } from "react";
import { followUser } from "../Functions/followUser";
import { AuthContext } from "../AuthServices/AuthProvider";
import { unfollowUser } from "../Functions/unfollowUser";

export default function Follower() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [followers, setFollowers] = useState(null);
  const [userFollowing, setUserFollowing] = useState(null);
  const [isFollowed, setIsFollowed] = useState([]);

  async function fetchFollower() {
    try {
      const res = await fetch(`http://localhost:3000/followerName/${id}`);
      if (!res.ok) throw new Error("Couldn't get responses");
      const data = await res.json();
      console.log(data);
      setFollowers(data);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function fetchUserFollowing() {
    try {
      const res = await fetch(`http://localhost:3000/following/${user.id}`);
      if (!res.ok) throw new Error("Couldn't get responses");
      const data = await res.json();

      setUserFollowing(data);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  function detectFollowed() {
    const followingSet = new Set(userFollowing.map((u) => u.user_id));

    const followed = followers.map((f) => followingSet.has(f.id));

    setIsFollowed(followed);
  }

  async function handleFollow(id, followed) {
    console.log(followed);
    const isSuccess = followed ? await unfollowUser(id) : await followUser(id);
    if (!isSuccess) return;
    await fetchUserFollowing();
    detectFollowed();
  }

  useEffect(() => {
    if (!user) return;
    fetchFollower();
    fetchUserFollowing();
  }, [user]);

  useEffect(() => {
    if (userFollowing) detectFollowed();
  }, [userFollowing]);

  function log() {
    console.log(isFollowed);
  }
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
              to={`/profile/${id}`}
            >
              <button id={styles.backButton}>Back</button>
            </Link>
            <button id={styles.backButton} onClick={log}>
              Log
            </button>
          </div>
          {user && (
            <div className={styles.followerSection}>
              {followers &&
                followers.map((follower, index) => (
                  <FollowerCard
                    username={follower.name}
                    profileLink={`/profile/${follower.id}`}
                    followText={
                      follower.id === user.id
                        ? "You"
                        : isFollowed[index]
                          ? "Followed"
                          : "Follow"
                    }
                    pfp={avatar}
                    handleFollowButton={() => {
                      if (follower.id === user.id) return;
                      handleFollow(follower.id, isFollowed[index]);
                    }}
                    key={index}
                  ></FollowerCard>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
