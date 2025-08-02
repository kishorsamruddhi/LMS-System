"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { BrainCircuit, LoaderPinwheel, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Fragment, use, useEffect, useState } from "react";
import { UserContext } from "@/store/User_Context";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { redirect } from "next/navigation";
import Image from "next/image";
import { cn } from "@/utils/cn";

const getRootLink = {
    admin: "/admin/",
    user: "/learner/",
}

export default function Header({ containerSt }) {
    const { auth, isAuhtLoading, sign_out_handler } = use(UserContext)
    const [rootLink, setRootLink] = useState("/")

    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            const role = auth?.role
            const final = getRootLink[role] || "/"
            setRootLink(final)
        }
    }, [isAuhtLoading, auth])

    function getStarted() {
        redirect(rootLink + "get-started")
    }
    function getEmailVerify() {
        redirect(rootLink + "email-verify")
    }

    function goTosettings() {
        redirect(rootLink + "settings")
    }

    const menuProps = {
        auth, sign_out_handler, rootLink, getStarted, getEmailVerify, goTosettings
    }


    function Conditional() {
        if (isAuhtLoading) {
            return <LoaderPinwheel />
        }
        const isAuth = auth ? <AuthPopOverMenu {...menuProps} /> : <Link href={"/auth/signin"}
            className={"border-2 border-gray-300 py-1 px-3  rounded-md hover:border-cyan-600  hover:text-cyan-600"}>
            Get Started
        </Link>
        return <Fragment>
            {isAuth}
        </Fragment>
    }
    return (
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className={cn("px-6 py-4 flex justify-between items-center", containerSt)}>
                <div className="text-2xl gap-1 flex items-center font-bold text-cyan-600">
                    {/* <PencilRuler /> */}
                    <Image height={48} width={48} src={"/Icons/school.png"} alt="digi-shiksha-logo" />
                    <Link href="/" >Digi Shiksha</Link>
                </div>
                <div>
                    {Conditional()}
                </div>
            </div>
        </header>
    );
}


function AuthPopOverMenu({ auth, rootLink, sign_out_handler, getStarted, getEmailVerify, goTosettings }) {
    return <DropdownMenu>
        <DropdownMenuTrigger
            variant="solid"
            className={"border-2 border-gray-300 transition-colors cursor-pointer rounded-full p-1 hover:border-cyan-600  hover:text-cyan-600"}>
            <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"bg-white shadow-2xl border-gray-200 cursor-pointer"}>
            <DropdownMenuLabel>{auth.username} <span className="text-gray-400">({auth.email})</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => redirect(rootLink || "#")} className="p-2 block w-full text-sm rounded hover:bg-gray-200">
                Dashboard
            </DropdownMenuItem>
            {!auth?.business_course_id && <DropdownMenuItem onClick={getStarted} className="p-2 block w-full text-sm rounded hover:bg-gray-200">
                Join Institue
            </DropdownMenuItem>}
            {!auth?.isEmailVerified && <DropdownMenuItem onClick={getEmailVerify} className="p-2 block w-full text-sm rounded border-2 border-cyan-500 hover:bg-gray-200">
                Email verification
            </DropdownMenuItem>}
            <DropdownMenuItem onClick={goTosettings} className="p-2 block w-full text-sm rounded  hover:bg-gray-200">
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sign_out_handler} className="p-2 text-left w-full text-sm rounded hover:bg-gray-200" >Logout</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu >
}