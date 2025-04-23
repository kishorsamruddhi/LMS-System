import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./store/User_Context";
import { SuperUserContext } from "./store/Super_User_Context";

const mainStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
  textAlign: "center",
  justifyContent: "center",
  height: "calc(100vh - var(--header-h))",
  backgroundColor: "var(--main-Bg)",
  color: "var(--xp-primary-color)",
}
const linkDivStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  justifyContent: "center",
}
const linkStyle = {
  fontWeight: "600",
  border: "none",
  textAlign: "center",
}
export default function RootNotFound() {
  return (
    <div style={mainStyle} >
      <h2>Page Not Found</h2>
      <p>Could not find the requested resource</p>
      <div style={linkDivStyle} className="buttons"  >
        <Link style={linkStyle} className="link button" to="/">Return Home </Link>
      </div>
    </div>
  );
}


export function NotFoundInUser() {
  const { auth } = useContext(UserContext)
  return (
    <div style={mainStyle} >
      <h2>Page Not Found</h2>
      <p>Could not find the requested resource</p>
      <div style={linkDivStyle} className="buttons"  >
        {auth ?
          <Link style={linkStyle} className="link button" to="/dashboard">Return Home </Link> :
          <Link style={linkStyle} className="link button" to="/">Return Home </Link>
        }
      </div>
    </div>
  );
}


export function NotFoundInSuperAdmin() {
  const { auth } = useContext(SuperUserContext)
  return (
    <div style={mainStyle} >
      <h2>Page Not Found</h2>
      <p>Could not find the requested resource</p>
      <div style={linkDivStyle} className="buttons"  >
        {auth ?
          <Link style={linkStyle} className="link button" to="/super-admin/dashboard">Return Home </Link> :
          <Link style={linkStyle} className="link button" to="/super-admin/">Return Home </Link>
        }
      </div>
    </div>
  );
}

