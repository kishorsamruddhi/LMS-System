import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const AdminBackButton = ({ addOnPath = "" }) => {
    return <Button asChild className={"border border-gray-100 hover:border-cyan-500 hover:text-cyan-500"}>
        <Link href={"/admin" + addOnPath}>
            <ArrowLeft />
        </Link>
    </Button>
}

export default AdminBackButton