import { UserContext } from "@/store/User_Context";
import Link from "next/link";
import { useContext } from "react";

export default function ErrorPage({ message, showSubscriptionPageBtn = false }) {
  let buy = undefined
  if (typeof message === "string") {
    if (message?.includes("Subscription")) {
      buy = true
    }
  }

  const { auth } = useContext(UserContext);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        height: "calc(100vh - var(--header-h))",
        backgroundColor: "var(--main-Bg)",
        color: "var(--xp-primary-color)",
      }}
    >
      <h2>Error Occured </h2>
      <p>Error Details:</p>
      <p style={{ color: "#efc4d2" }}>{message}</p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
        className="buttons"
      >
        {auth && showSubscriptionPageBtn && (
          <Link
            style={{
              fontWeight: "600",
              border: "none",
              textAlign: "center",
            }}
            className="link button"
            href={buy ? "/dashboard/subscription" : "/dashboard"}
          >
            Go To Subsription Page
          </Link>
        )}
      </div>
    </div>
  );
}
