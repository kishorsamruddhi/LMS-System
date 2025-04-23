import Link from "next/link";
import { Button } from "./ui/button";
import { Menu, PencilRuler } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
    return (
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl gap-1 flex items-center font-bold text-cyan-600">
                    <PencilRuler />
                    <Link href="/" >LMS Platform</Link>
                </div>

                <nav className="hidden md:flex space-x-8">
                    <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
                    <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                    <Link href="#about" className="text-gray-600 hover:text-gray-900">About</Link>
                    <Link href="#contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                </nav>

                <div className="hidden md:block">
                    <Link href={"/auth/signin"}>
                        <Button
                            variant="solid"
                            className={"border-2 border-gray-300 hover:border-cyan-600  hover:text-cyan-600"}
                            size="lg"
                        >
                            Get Started
                        </Button>
                    </Link>
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
