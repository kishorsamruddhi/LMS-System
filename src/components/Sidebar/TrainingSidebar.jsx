"use client";
import "./sidebar.scss";
import { useState, useLayoutEffect, useEffect, useContext } from 'react';
import { UserContext } from '@/store/User_Context';
import Link from "next/link";
import { Book, ChartArea, Home, LogOut, Mail, MoveLeft, School, Trophy } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const TrainingSidebar = () => {
    const pathname = usePathname()
    const { auth, sign_out_handler } = useContext(UserContext);
    const [windowWidth, setWindowWidth] = useState(400);

    useLayoutEffect(() => {
        const handleResize = debounce(() => {
            setWindowWidth(window.innerWidth);
        }, 1000);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
        }
    }, []);



    const link_prefix = "/learner";
    const navigations = auth?.business_course_id && auth?.isEmailVerified ? [
        { icon: <Home />, label: "Dashboard", route: "/", },
        { icon: <Book />, label: "Technologies", route: "/my-courses", },
        { icon: <ChartArea />, label: "Reports", route: "/report", },
        { icon: <Trophy />, label: "My Certificates", route: "/certificates" },
    ] : [
        { icon: <Mail />, label: "Email Verifiy", route: "/email-verify", },
        { icon: <School />, label: "institute", route: "/get-started", },
    ];

    if (windowWidth < 800) {
        return null;
    }
    const isActive = (path) => {
        if (pathname + "/" === path) return true
        return pathname === path;
    };

    return (
        <div className='Sidebar shadow-4 quick' id='sidebar'>
            <div className="bottom">
                <DynamicBackButton>
                    <MoveLeft />
                    <span>Back</span>
                </DynamicBackButton>
            </div>
            <div className="navigations">
                {navigations.map((item, index) => (
                    <Link
                        aria-label={item.label}
                        data-title-name={item.label}
                        key={index}
                        className={cn(isActive(link_prefix + item.route) ? "active" : "")}
                        href={`${link_prefix + item.route}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
            <div className="bottom">
                <div style={{ border: "1px solid transparent" }} className='iconBtn' onClick={sign_out_handler} data-title-name={"Setting"}>
                    <LogOut />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

const DynamicBackButton = ({ children, href, hardURL, ...props }) => {
    const segments = typeof window !== 'undefined' ? location.pathname.split('/') : [];
    segments.pop();
    segments.pop();
    const newHref = segments.join('/');
    return (
        <Link className="back" href={hardURL || newHref} {...props}>
            {children || "Back"}
        </Link>
    );
};

export default TrainingSidebar;
