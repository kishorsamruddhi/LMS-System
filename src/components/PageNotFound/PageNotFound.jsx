import React from 'react'
import "./styles.scss"
import Link from 'next/link'

const PageNotFound = ({ returnLink, returnLable, }) => {
    return (
        <div className='NotFound'>
            <div className="face">
                <div className="band">
                    <div className="red"></div>
                    <div className="white"></div>
                    <div className="blue"></div>
                </div>
                <div className="eyes"></div>
                <div className="dimples"></div>
                <div className="mouth"></div>
            </div>

            <h1>Oops! Something went wrong!</h1>
            <p className='text-center font-bold text-red-400'>Page not found</p>
            <Link href={returnLink || "/"} className='btn bg-cyan-600  hover:bg-cyan-900' style={{ textDecoration: "none", color: "#fff" }}>
                {returnLable || "Return to Home"}
            </Link>
        </div>
    )
}

export default PageNotFound