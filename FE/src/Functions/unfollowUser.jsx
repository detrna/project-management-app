import { authFetch } from "./AuthFetch";

export async function unfollowUser(id) {
  try {
    const res = await authFetch(`/unfollow/${id}`, "DELETE");

    if (!res.ok) throw new Error("Couldn't get responses");

    const data = await res.json();

    console.log(data);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
