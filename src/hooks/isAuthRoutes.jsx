import { UserContext } from '@/store/User_Context'
import React, { use } from 'react'

export default function isAuthRoutes() {
    const { auth } = use(UserContext)

    return (
        <div>isAuthRoutes</div>
    )
}
