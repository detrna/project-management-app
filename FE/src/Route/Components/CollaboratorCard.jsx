import avatar from "./img/avatar.png";
import styles from "./CollaboratorCard.module.css";
import { Link } from "react-router-dom";

export default function CollaboratorCard({
  username,
  buttonText,
  handleButton,
  handleRemoveButton,
  owner,
  collaborationMenu,
  handleMenuIcon,
  handleMenuIconMember,
  openingMenu,
  profileLink,
  ownerAccount,
  memberAccount,
}) {
  function SettingMenu() {
    return (
      <div className={styles.menuContainer}>
        {owner ? (
          <>
            <button className={styles.menuButton} onClick={handleRemoveButton}>
              Set role
            </button>
            <button className={styles.menuButton} onClick={handleRemoveButton}>
              Remove user
            </button>
          </>
        ) : (
          <button className={styles.menuButton} onClick={handleRemoveButton}>
            Leave project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.userCard}>
      <Link className={styles.link} to={profileLink}>
        <div className={styles.credentials}>
          <img src={avatar} id={styles.avatar}></img>
          <p id={styles.textUsername}>{username}</p>
        </div>
      </Link>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleButton}>
          {buttonText}
        </button>
        {owner && collaborationMenu && !ownerAccount && (
          <i
            className={`fa-solid fa-ellipsis-vertical ${styles.menuIcon}`}
            onClick={handleMenuIcon}
          ></i>
        )}
        {!owner && collaborationMenu && memberAccount && (
          <i
            className={`fa-solid fa-ellipsis-vertical ${styles.menuIcon}`}
            onClick={handleMenuIcon}
          ></i>
        )}
      </div>
      {openingMenu && (
        <div className={styles.settingMenuContainer}>
          <SettingMenu />
        </div>
      )}
    </div>
  );
}
