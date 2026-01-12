import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Route/Home";
import Login from "./Route/Login";
import Register from "./Route/Register";
import Profile from "./Route/Profile";
import Project from "./Route/Project";
import ProjectForm from "./Route/ProjectForm";

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
    children: [
      {
        path: "create",
        element: <ProjectForm></ProjectForm>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
