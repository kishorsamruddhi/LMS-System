import Link from 'next/link'
import React from 'react'

const LinkButton = ({ href = "#", children, label = "Link" }) => {
    return <Link className='py-2 whitespace-nowrap text-sm font-medium transition-all px-4 rounded-md border-2 border-gray-300 hover:border-cyan-400' href={href}>
        {children || label}
    </Link>
}

export default LinkButton