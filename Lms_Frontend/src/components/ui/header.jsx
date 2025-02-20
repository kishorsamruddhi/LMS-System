// Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './popover';
import { User } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-teal-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    {/* <img src="/path/to/logo.png" alt="Logo" className="h-8 mr-2" /> */}
                    <h1 className="text-2xl font-bold">LMS</h1>
                </div>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <NavLink to="/" className={({ isActive }) => (isActive ? 'underline' : 'hover:underline')}>
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses" className={({ isActive }) => (isActive ? 'underline' : 'hover:underline')}>
                                Courses
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'underline' : 'hover:underline')}>
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/logout" className={({ isActive }) => (isActive ? 'underline' : 'hover:underline')}>
                                Logout
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Avatar with ShadCN Popover Menu */}
                <Popover>
                    <PopoverTrigger className="focus:outline-none">
                        <User className="h-8 w-8 text-white" />
                    </PopoverTrigger>
                    <PopoverContent className="absolute right-0 z-10 mt-2 w-48 bg-white text-black rounded-md shadow-lg"><div className="p-4">
                        <h3 className="font-semibold">User Name</h3>
                        <ul className="mt-2">
                            <li className="py-1 hover:bg-gray-200">
                                <NavLink to="/settings">Settings</NavLink>
                            </li>
                            <li className="py-1 hover:bg-gray-200">
                                <NavLink to="/help">Help</NavLink>
                            </li>
                            <li className="py-1 hover:bg-gray-200">
                                <NavLink to="/logout">Logout</NavLink>
                            </li>
                        </ul>
                    </div>.</PopoverContent>
                </Popover>
            </div>
        </header>
    );
};

export default Header;
