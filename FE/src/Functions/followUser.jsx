import { authFetch } from "./AuthFetch";

export async function followUser(id) {
  try {
    const res = await authFetch(`/follow/${id}`, "POST");

    if (!res.ok) throw new Error("Couldn't get responses");

    const data = await res.json();

    console.log(data);
    return true;
  } catch (err) {
    console.log(err);
  }
}
