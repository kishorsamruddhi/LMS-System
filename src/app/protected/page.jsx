"use client";
import { signOut, useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Welcome to Next.js with NextAuth!
      </h1>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">User Information</h2>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="text-center">
              <p className="text-lg">Signed in as:</p>
              <p className="text-lg font-medium">{session.user.email}</p>
              <p className="text-sm text-gray-500">
                You can now access your GitHub data!
              </p>
              <Avatar className={"h-[120px] w-[120px] mx-auto"}>
                <AvatarImage width={120} height={120} src={session.user.image} />
                <AvatarFallback>{session.user.name}</AvatarFallback>
              </Avatar>
              <Button className="border-2 border-gray-300 mt-4"
                onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg">Not signed in</p>
              <p className="text-sm text-gray-500">
                Please sign in to access your data.
              </p>
            </div>
          )}
        </CardContent>
        {!session && <CardFooter className="flex justify-center">
          <Link href="/auth/signin">
            <Button className="border-2 border-gray-300 ">
              Sign In
            </Button>
          </Link>
        </CardFooter>}
      </Card>
    </div>
  );
}
