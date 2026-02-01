export async function fetchCollaborator(project_id) {
  try {
    const res = await fetch(
      `http://localhost:3000/fetchCollaborator/${project_id}`,
    );
    if (!res.ok)
      throw new Error("Couldn't get responese from fetchCollaborator");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
