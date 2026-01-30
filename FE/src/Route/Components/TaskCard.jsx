import styles from "./TaskCard.module.css";

export default function TaskCard({ milestones, taskName, taskCompletion }) {
  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <icon id={styles.circle}></icon>
        <p id={styles.textNama}>{taskName}</p>
        <p id={styles.pecahan}>{taskCompletion}</p>
      </div>
      <div className={styles.milestoneList}>
        {milestones.map((milestone) => (
          <div className={styles.milestoneContainer} key={milestone.id}>
            <i id={styles.square}></i>
            <p id={styles.textMilestone}>{milestone.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
