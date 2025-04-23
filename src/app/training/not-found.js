"use client";

import Link from "next/link";

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
};
const linkDivStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  justifyContent: "center",
};
const linkStyle = {
  fontWeight: "600",
  border: "none",
  textAlign: "center",
};

export default function RootNotFound() {
  return (
    <div style={mainStyle}>
      <h2>Training Page Not Found</h2>
      <p>Could not find the requested resource</p>
      <div style={linkDivStyle} className="buttons">
        <Link style={linkStyle} className="link button" href="/">
          Return Home{" "}
        </Link>
      </div>
    </div>
  );
}
