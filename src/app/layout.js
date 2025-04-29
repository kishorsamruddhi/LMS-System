import { Poppins } from "next/font/google"; // Import only Poppins
import "./globals.css";
import { UserProvider } from "@/store/User_Context";
import Header from "@/components/Header";

// Add Poppins font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Specify the weights you need
});

export const metadata = {
  title: "Digi-Shiksha",
  description: "Learning Management System",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`} // Use only Poppins variable
      >
        <UserProvider>
          <Header />
          <div className="mt-[72px]">{children}</div>
        </UserProvider>
      </body>
    </html>
  );
}
