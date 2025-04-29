"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { BrainCircuit, Menu, PencilRuler } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { use } from "react";
import { UserContext } from "@/store/User_Context";

export default function Header() {
    const { auth } = use(UserContext)

    return (
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl gap-1 flex items-center font-bold text-cyan-600">
                    {/* <PencilRuler /> */}
                    <BrainCircuit />
                    <Link href="/" >Digi Shiksha</Link>
                </div>
                <div className="hidden md:block">
                    {auth ?
                        <Button
                            variant="solid"
                            className={"border-2 border-gray-300"}
                            size="lg"
                        >
                            {auth.email}
                        </Button>
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
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Menu />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={"bg-white shadow-2xl border-gray-200"}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="flex flex-col w-[150px]">
                                <Link className="p-2 rounded hover:bg-gray-200" href={"#"}>Profile</Link>
                                <Link className="p-2 rounded hover:bg-gray-200" href={"#"}>Billing</Link>
                                <Link className="p-2 rounded hover:bg-gray-200" href={"#"}>Team</Link>
                                <Link className="p-2 rounded hover:bg-gray-200" href={"#"}>Subscription</Link>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
