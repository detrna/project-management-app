export async function authFetch(endpoint, method, payload) {
  try {
    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (res.status !== 403) return res;

    console.log("WERE REFRESHING");

    const refresh = await fetch("http://localhost:3000/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!refresh.ok) {
      throw new Error("Couldn't fetch from /refresh");
    }

    return fetch(`http://localhost:3000${endpoint}`, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.log(err);
  }
}
