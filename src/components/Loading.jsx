import React from 'react'

const LoadingSpinner = ({ height = "100vh" }) => {
    return (
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height }} >
            {/* <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i> */}
            <div className="loader"></div>
        </div>
    )
}


/* HTML: <div class="loader"></div> */

export default LoadingSpinner