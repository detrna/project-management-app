import { Link, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./Collaborator.module.css";
import avatar from "./img/avatar.png";
import CollaboratorCard from "./Components/collaboratorCard";
import { useContext, useEffect, useRef, useState } from "react";
import { searchProfile } from "../Functions/searchProfile";
import { AuthContext } from "../AuthServices/AuthProvider";
import { authFetch } from "../Functions/AuthFetch";
import { fetchCollaborator } from "../Functions/fetchCollaborator";

export default function Collaborator() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  const [collaborators, setCollaborators] = useState(null);
  const [addingPeople, setAddingPeople] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerId, setOwnerId] = useState();
  const [openedMenu, setOpenedMenu] = useState([]);
  const inputInviteRef = useRef(null);

  function handleAddPeople() {
    setAddingPeople(addingPeople ? false : true);
  }

  async function handleInviteInput(value) {
    if (value == "") {
      setSearchedUsers(null);
      return;
    }

    const res = await searchProfile(value);
    const collaboratorFilter = await detectAlreadyCollaborated(res);
    const invitedFilter = await detectInvited(collaboratorFilter);
    setSearchedUsers(invitedFilter);
  }

  async function detectAlreadyCollaborated(searchedUserList) {
    const collaboratorIds = collaborators.map((c) => c.user_id);

    const collaboratorFilter = searchedUserList.filter(
      (u) => !collaboratorIds.includes(u.id),
    );
    return collaboratorFilter;
  }

  async function detectInvited(collaborator) {
    const invitedIds = await getInvitedUser();

    const filteredUser = collaborator.map((u) => {
      if (invitedIds.includes(u.id)) {
        return { ...u, invited: true };
      }
      return u;
    });

    return filteredUser;
  }

  async function getInvitedUser() {
    try {
      const res = await authFetch(`/getInvitedUser/${id}`);
      if (!res.ok)
        throw new Error("Couldn't get responses from getInvitedUser");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  async function inviteUser(user_id) {
    try {
      const res = await authFetch(`/invite/${id}/${user_id}`, "POST");
      if (!res.ok) throw new Error("Couldn't get responses from invite");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  async function handleInviteButton(user_id) {
    const invited = await inviteUser(user_id);
    if (invited) handleInviteInput(inputInviteRef.current.value);
  }

  async function handleRemoveUser(user_id) {
    const remove = await removeCollaborator(user_id);
    const refreshCollaborator = await fetchCollaborator(id);
    setCollaborators(refreshCollaborator);
  }

  async function removeCollaborator(user_id) {
    try {
      const res = await authFetch(
        `/removeCollaborator/${id}/${user_id}`,
        "DELETE",
      );
      if (!res.ok)
        throw new Error("Couldn't get responses from removeCollaborator");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(
    () => async () => {
      const collaborator = await fetchCollaborator(id);
      setCollaborators(collaborator);
    },
    [],
  );

  async function detectOwner(collaborator) {
    const owner = collaborator.find((c) => c.role === "Owner");
    if (owner.user_id === user.id) return owner.user_id;
    return false;
  }

  function detectMember(user_id, role) {
    if (!user) return;
    if (user_id === user.id && role !== "Owner") return true;
    return false;
  }

  function setupOpenedMenu() {
    if (!collaborators) return;
    const menu = collaborators.map((c) => false);
    setOpenedMenu(menu);
  }

  useEffect(() => {
    setupOpenedMenu();
  }, [collaborators]);

  function handleMenu(index) {
    if (openedMenu[index]) {
      const menu = openedMenu.map((m) => false);
      setOpenedMenu(menu);
      return;
    }
    const menu = openedMenu.map((m, mIndex) =>
      index === mIndex ? true : false,
    );
    setOpenedMenu(menu);
  }

  async function log() {
    console.log(openedMenu);
  }

  const SearchField = () => {
    if (!searchedUsers || searchedUsers.length === 0) return;
    return (
      <div className={styles.searchFieldContainer}>
        {searchedUsers?.map((user, index) => {
          return (
            <CollaboratorCard
              username={user.name}
              buttonText={user.invited ? "Invited" : "Invite"}
              handleButton={() =>
                !user.invited ? handleInviteButton(user.id) : ""
              }
              profileLink={`/profile/${user.id}`}
              key={index}
            />
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    async function loadOwnerData() {
      if (!user || !collaborators) return;
      if (collaborators.length === 0) {
        setIsOwner(true);
        setOwnerId(user.id);
        return;
      }
      const owner = await detectOwner(collaborators);
      setIsOwner(owner ? true : false);
      setOwnerId(owner);
    }
    loadOwnerData();
  }, [user?.id, collaborators]);
  if (!collaborators) return <></>;

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Project Collaborators</h1>
            {/*
            <button id={styles.backButton} onClick={log}>
              LOG
            </button>
              */}
            <Link className={styles.link} to={`/project/${id}`}>
              <button id={styles.backButton}>Back</button>
            </Link>
          </div>

          <div className={styles.userSection}>
            <div className={styles.inviteContainer}>
              {addingPeople ? (
                <div className={styles.searchSection}>
                  <input
                    placeholder="invite user..."
                    className={styles.input}
                    onChange={(e) => handleInviteInput(e.target.value)}
                    ref={inputInviteRef}
                  ></input>
                </div>
              ) : (
                <p className={styles.textCollaboratorCount}>
                  {" "}
                  {collaborators.length <= 1
                    ? "No collaborators"
                    : `${collaborators.length - 1} collaborators`}
                </p>
              )}
              {isOwner && (
                <button className={styles.addButton} onClick={handleAddPeople}>
                  {addingPeople ? "Collaborators" : "Add people"}
                </button>
              )}
            </div>

            {addingPeople ? (
              <SearchField />
            ) : (
              <>
                {collaborators?.map((c, index) => {
                  if (openedMenu.length === 0) return <></>;
                  return (
                    <CollaboratorCard
                      username={c.name}
                      buttonText={c.role}
                      key={index}
                      owner={isOwner}
                      collaborationMenu={!addingPeople}
                      handleMenuIcon={() => handleMenu(index)}
                      openingMenu={openedMenu[index]}
                      handleRemoveButton={() => handleRemoveUser(c.user_id)}
                      profileLink={`/profile/${c.user_id}`}
                      ownerAccount={c.user_id === ownerId}
                      memberAccount={detectMember(c.user_id, c.role)}
                    />
                  );
                }) || <></>}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
