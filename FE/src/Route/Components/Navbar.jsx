import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ name }) {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="container">
      <p className="leftSide">Project Management App</p>
      {!loggedIn ? (
        <div className="rightSide">
          <Link to={"/login"}>
            <button>Login</button>
          </Link>
          <Link to={"/register"}>
            <button>Register</button>
          </Link>
        </div>
      ) : (
        <div className="rightSide">
          <p>{name}</p>

          <i class="fa-solid fa-user"></i>
        </div>
      )}
    </div>
  );
}
