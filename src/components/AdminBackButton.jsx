import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { tailwindBtnClasses } from './TailwindBtn'
import { cn } from '@/utils/cn'

const AdminBackButton = ({ addOnPath = "" }) => {
    return <Link className={cn(tailwindBtnClasses)} href={"/admin" + addOnPath}>
        <ArrowLeft height={18} width={18} />
    </Link>
}

export default AdminBackButton