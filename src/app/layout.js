import { Poppins } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/store/User_Context";
import Header from "@/components/Header";
import { cn } from "@/utils/cn";

// Add Poppins font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Digi-Shiksha",
  description: "Learning Management System",
};

export default async function RootLayout({ children }) {
  const containerSt = "max-w-[1500px] mx-auto";
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <UserProvider>
          <Header containerSt={containerSt} />
          <main className={cn("mt-[72px]", containerSt)}>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
