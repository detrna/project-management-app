export async function searchProfile(value) {
  try {
    const res = await fetch(`http://localhost:3000/searchProfile/${value}`);
    if (!res.ok) throw new Error("Couldn't fetch responses");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
