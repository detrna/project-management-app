import { authFetch } from "../../Functions/AuthFetch";
import styles from "./MailMenu.module.css";
import avatar from "./img/avatar.png";

export default function MailMenu({ mail, updateMail }) {
  function handleLeftButton(content, mailId) {
    if (content.includes("project invitation"))
      declineProjectInvitation(mailId);
    updateMail();
    updateMail();
  }

  function handleRightButton(content, mailId, mailContent) {
    if (content.includes("project invitation"))
      acceptProjectInvitation(mailId, mailContent);
    updateMail();
    updateMail;
  }

  async function acceptProjectInvitation(mailId, mailContent) {
    try {
      const res = await authFetch(`/acceptProject/${mailId}`, "DELETE", {
        mailContent,
      });
      if (!res.ok) throw new Error("Couldn't get responses from acceptProject");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  async function declineProjectInvitation(mailId) {
    try {
      const res = await authFetch(`/declineProject/${mailId}`, "DELETE");
      if (!res.ok) throw new Error("Couldn't get responses from acceptProject");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.textHeader}>
          {mail.length === 0 ? "No mails yet" : `${mail.length} mails`}
        </h4>
      </div>
      <div className={styles.mailList}>
        {mail?.map((m, index) => {
          return (
            <div className={styles.mailCard} key={index}>
              <div className={styles.nameContainer}>
                <div className={styles.nameCard}>
                  <img src={avatar} className={styles.avatar}></img>
                  <p className={styles.textName}>{m.sender_name}</p>
                </div>
                <p className={styles.textContent}>{m.content}</p>
              </div>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.button}
                  onClick={() =>
                    handleLeftButton(m.content.toLowerCase(), m.id, m.content)
                  }
                >
                  Decline
                </button>
                <button
                  className={styles.button}
                  onClick={() =>
                    handleRightButton(m.content.toLowerCase(), m.id, m.content)
                  }
                >
                  Accept
                </button>
              </div>
            </div>
          );
        }) || <></>}
      </div>
    </div>
  );
}
