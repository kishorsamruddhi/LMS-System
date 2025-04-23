"use client"; // Make this file a client component (you need it for NextAuth)

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

const SignInPage = () => {
  const [email, setEmail] = useState("");

  const handleSignInWithEmail = () => {
    signIn("credentials", { email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-sm w-full space-y-8 p-6 bg-white rounded-xl shadow-xl">
        <CardHeader>
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            Sign In
          </h2>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => signIn("google")}
                variant="outline"
                fullWidth
                className="flex items-center justify-center space-x-2 rounded-md"
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => signIn("google")}
                variant="outline"
                fullWidth
                className="flex items-center justify-center space-x-2 rounded-md"
              >
                <Github className="w-5 h-5" />
              </Button>
            </div>


            {/* Divider */}
            <div className="relative my-4">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Or</span>
              </div>
            </div>

            {/* Email Sign-In Form */}
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                className="border-gray-300 "
              />
            </div>
            <Button
              onClick={handleSignInWithEmail}
              fullWidth
              className="border-gray-300 border-2 mt-4"
            >
              Sign in with Email
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
