import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const AdminBackButton = ({ addOnPath = "" }) => {
    return <Button asChild>
        <Link href={"/TrainingDashboard" + addOnPath}>
            <ArrowLeft />
        </Link>
    </Button>
}

export default AdminBackButton