import styles from "./TaskCard.module.css";

export default function TaskCard() {
  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <icon id={styles.circle}></icon>
        <p id={styles.textNama}>Racang UI/UX</p>
        <p id={styles.pecahan}>3/3</p>
      </div>
      <div className={styles.milestoneList}>
        <div className={styles.milestoneContainer}>
          <i id={styles.square}></i>
          <p id={styles.textMilestone}>Rancang desain</p>
        </div>
        <div className={styles.milestoneContainer}>
          <i id={styles.square}></i>
          <p id={styles.textMilestone}>Rancang desain</p>
        </div>
        <div className={styles.milestoneContainer}>
          <i id={styles.square}></i>
          <p id={styles.textMilestone}>Rancang desain</p>
        </div>
      </div>
    </div>
  );
}
