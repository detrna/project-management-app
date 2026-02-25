export async function fetchProject(id) {
  try {
    const res = await fetch(`http://localhost:3000/fetchProject/${id}`);
    if (!res.ok) throw new Error("Couldn't get responses from fetchProject");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return false;
  }
}
