export async function fetchProfile(id) {
  try {
    const res = await fetch(`http://localhost:3000/fetchProfile/${id}`);
    if (!res.ok) throw new Error("Couldn't fetch responses");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
