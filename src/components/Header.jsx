"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { BrainCircuit, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { use, useEffect, useState } from "react";
import { UserContext } from "@/store/User_Context";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { redirect } from "next/navigation";

const getRootLink = {
    admin: "/admin/",
    user: "/learner/",
}

export default function Header() {
    const { auth, isAuhtLoading, sign_out_handler } = use(UserContext)
    const [rootLink, setRootLink] = useState("/")
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            const role = auth?.role
            const final = getRootLink[role] || "/"
            setRootLink(final)
            setUser(auth)
        }
    }, [isAuhtLoading, auth])

    const getStarted = rootLink + "get-started"
    const getEmailVerify = rootLink + "email-verify"

    const menuProps = {
        auth: user, sign_out_handler, rootLink, getStarted, getEmailVerify
    }
    return (
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl gap-1 flex items-center font-bold text-cyan-600">
                    {/* <PencilRuler /> */}
                    <BrainCircuit />
                    <Link href="/" >Digi Shiksha</Link>
                </div>
                <div>
                    {user ?
                        <AuthPopOverMenu {...menuProps} />
                        :
                        <Link href={"/auth/signin"}>
                            <Button
                                variant="solid"
                                className={"border-2 border-gray-300 hover:border-cyan-600  hover:text-cyan-600"}
                                size="lg"
                            >
                                Get Started
                            </Button>
                        </Link>
                    }
                </div>
            </div>
        </header>
    );
}


function AuthPopOverMenu({ auth, rootLink, sign_out_handler, getStarted, getEmailVerify }) {
    return <DropdownMenu>
        <DropdownMenuTrigger>
            <Button
                variant="solid"
                className={"border-2 border-gray-300 hover:border-cyan-600  hover:text-cyan-600"}
                size="lg">
                <Menu />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"bg-white shadow-2xl border-gray-200 cursor-pointer"}>
            <DropdownMenuLabel>{auth.username} <span className="text-gray-400">({auth.email})</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => redirect(rootLink || "#")} className="p-2 block w-full text-sm rounded hover:bg-gray-200">
                Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => redirect(getStarted || "#")} className="p-2 block w-full text-sm rounded hover:bg-gray-200">
                Setup
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => redirect(getEmailVerify || "#")} className="p-2 block w-full text-sm rounded hover:bg-gray-200">
                Email verification
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sign_out_handler} className="p-2 text-left w-full text-sm rounded hover:bg-gray-200" >Logout</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}