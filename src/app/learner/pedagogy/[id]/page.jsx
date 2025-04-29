"use client";

import "./styles.scss"
import style from "./playlist.module.scss"
import React, { Fragment, use, useState } from 'react'
import { get_pedagoggies_with_status } from '@/api/get'
import { useQuery } from "@tanstack/react-query"
import VideoSection from "./VideoPlayer"
import LoadingSpinner from "@/components/Loading"
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { SkipForward } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const Pedagogy = ({ params }) => {
    const { id } = use(params)
    const [activePedagogy, setActivePedagogy] = useState(0)
    const {
        data,
        isError,
        isLoading,
        error
    } = useQuery({
        queryKey: ["module_id", id],
        queryFn: () => pedagogy(id),
        staleTime: 60 * 1000 * 5,
        gcTime: 60 * 1000 * 10,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false
    })

    async function pedagogy(id) {
        try {
            const res = await get_pedagoggies_with_status(id)
            if (!res?.error) {
                return res.data
            }
            return new Error(res.data);
        } catch (error) {
            return new Error(error.message);
        }
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isError) {
        return <h1>{error}</h1>
    }

    const module_data = data.module_id
    const course_id = module_data.course_id
    const childArray = module_data.pedagogies
    const completedArrayList = data.completed_pedagoggies
    const activePeda = childArray[activePedagogy]
    const isFirstQuestion = activePedagogy === 0
    const isLastQuestion = activePedagogy === childArray?.length - 1

    const PlayListSection = ({ items }) => {
        return <div className="testName" >
            {items.length > 0 && items.map((val, index) => {
                return <div key={index} className="swiper-card" onClick={() => setActivePedagogy(index)}>
                    {activePeda._id === val._id && <span className="currentTag">Playing</span>}
                    <div className="top">
                        <i className={completedArrayList.includes(val._id) ? "pi pi-check-circle" : "pi pi-circle"}></i>
                        <h3 className="title">{index + 1}. {val.title}</h3>
                    </div>
                    {/* <img height={120} width={120} src="/Icons/play-icon.svg" alt="play-icon" /> */}
                </div>
            })}

        </div>
    }
    const propsMobilePlaylistSection = {
        items: childArray, completedArrayList, activePeda, setActivePedagogy, activePedagogy
    }
    return (
        <div className='Pedagogy'>
            <div className="Pedagogy_nav">
                <div className="">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className={"hover:text-cyan-500"} href={"/learner/dashboard"}>My Courses</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className={"hover:text-cyan-500"} href={"/learner/dashboard"}>{module_data.module_name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className={"hover:text-cyan-500"}>{activePeda.title}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {/* <BackButton href="/learner/dashboard" /> */}
            </div>
            <div className="sticky-section">
                <div className="main-frame" id="mainFrame">
                    {activePeda.pedagogy_type === "VIDEO" && <VideoSection module_id={id} course_id={course_id} activePeda={activePeda} />}
                    <div className="text-section">
                        <h2 className="title">{activePeda.title}</h2>
                        <div className="DescriptionPanel" dangerouslySetInnerHTML={{ __html: activePeda.text }} >
                        </div>
                    </div>
                </div>
                <div className="sidebar-playlist">
                    <PlayListSection items={childArray} />
                </div>

            </div>
            {childArray.length > 0 && <div className="mobile-playlist-trigger">
                <MobilePlaylistSection {...propsMobilePlaylistSection} />
            </div>}
        </div>
    )
}

const MobilePlaylistSection = ({ items, activePeda, activePedagogy, completedArrayList, setActivePedagogy }) => {
    const [visibleBottom, setVisibleBottom] = useState(false);
    const upcomingVideo = items[activePedagogy]
    if (!upcomingVideo) return null
    return <Fragment>
        <div className="centered">
            <Button className=" bg-white triggerButton" onClick={() => setVisibleBottom(true)} >
                <SkipForward /> Next: {upcomingVideo.title}
            </Button>
        </div>
        <div className="mac">
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader >Playlist</SidebarHeader>
                    <SidebarContent>
                        {items.length > 0 && items.map((val, index) => {
                            return <SidebarGroup key={index} className={style.card} onClick={() => {
                                setActivePedagogy(index)
                            }}>
                                {activePeda._id === val._id && <span className={style.currentTag}>Playing</span>}
                                <div className="top">
                                    <i className={completedArrayList.includes(val._id) ? "pi pi-check-circle" : "pi pi-circle"}></i>
                                    <h3 className="title">{index + 1}. {val.title}</h3>
                                    <p className={style.des}>{val.text}</p>
                                </div>
                            </SidebarGroup>
                        })}
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>
        </div>
    </Fragment>
}

export default Pedagogy
