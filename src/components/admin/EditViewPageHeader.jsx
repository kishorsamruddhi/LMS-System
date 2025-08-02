import React from 'react'
import AdminBackButton from '@/components/AdminBackButton'
import { TailwindBtn } from '@/components/TailwindBtn'
import { formatDate } from '@/utils/timeFormatter'

export default function EditViewPageHeader({ editMode, headText, title, backBtnPath, time, toggler
}) {
    return (
        <div className="my-4 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap  gap-2 items-center">
                <AdminBackButton addOnPath={backBtnPath} />
                <h1 className="text-2xl">{headText} <span className="text-cyan-500">{title}</span> </h1>
            </div>
            <div className="flex gap-2 flex-wrap  items-center">
                <TailwindBtn hoverEffect={false} type="button" onClick={toggler}>{editMode ? "Switch To View Mode" : "Switch To Edit Mode"}</TailwindBtn>
                <TailwindBtn hoverEffect={false} >Last update on<span className="text-cyan-400">{formatDate(time)} </span>
                </TailwindBtn>
            </div>
        </div>
    )
}
