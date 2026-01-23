import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Route/Home";
import Login from "./Route/Login";
import Register from "./Route/Register";
import Profile from "./Route/Profile";
import Project from "./Route/Project";
import "./index.css";
import CreateProject from "./Route/CreateProject";
import Follower from "./Route/Follower";
import Collaborator from "./Route/Collaborator";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/register",
    element: <Register></Register>,
  },
  {
    path: "/profile/",
    element: <Profile></Profile>,
  },
  {
    path: "/project/",
    element: <Project></Project>,
  },
  {
    path: "/create-project",
    element: <CreateProject></CreateProject>,
  },
  {
    path: "/follower",
    element: <Follower></Follower>,
  },
  {
    path: "/following",
    element: <Follower></Follower>,
  },
  {
    path: "/collaborators",
    element: <Collaborator></Collaborator>,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
);
