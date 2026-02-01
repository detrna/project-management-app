import styles from "./TaskCard.module.css";

export default function TaskCard({
  milestones,
  taskName,
  taskCompletion,
  taskCompleted,
  owner,
  member,
  handleMilestoneButton,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <div className={styles.nameCard}>
          <i
            className={taskCompleted ? styles.circleGreen : styles.circleRed}
          ></i>
          <p className={styles.textNama}>{taskName}</p>
        </div>
        <p className={styles.pecahan}>{taskCompletion}</p>
      </div>
      <div className={styles.milestoneList}>
        {milestones.map((milestone, mIndex) => (
          <div className={styles.milestoneContainer} key={mIndex}>
            <i
              className={`
                ${milestone.completed ? styles.squareGreen : styles.squareRed} ${owner || member ? styles.pointer : ""} 
              `}
              onClick={() =>
                handleMilestoneButton(milestone.id, milestone.completed)
              }
            ></i>
            <p className={styles.textMilestone}>{milestone.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
