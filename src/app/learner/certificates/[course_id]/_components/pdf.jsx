import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image, PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import Confetti from 'react-confetti';
import Link from 'next/link';
import styles from './_pdf_styles.js';
import LoadingSpinner from '@/components/Loading.jsx';

const ThePDF_Container = ({ data }) => {
    const pdfRef = useRef(null)
    const username = data.user.username;
    const course_name = data.data.course_id.course_name
    const course_desc = data.data.course_id.course_desc
    const date = formatDate(data.data.updatedAt) || "-----"


    const [dim, setDim] = useState({
        width: 500,
        height: 500,
    })

    useLayoutEffect(() => {
        if (window) {
            const inW = window.innerWidth
            const inH = window.innerHeight
            setDim({ width: inW, height: inH })
        }
    }, [])

    function formatDate(time) {
        const fullTimeData = new Date(time)
        return fullTimeData.toDateString()
    }
    function CertificateDoc() {
        return (<Document>
            <Page size="LETTER" orientation="landscape" style={styles.page}>
                {/* Background Image */}
                <Image src="/assets/certificate-bg.jpg" style={styles.pageBackground} />

                {/* Content Wrapper */}
                <View style={styles.contentWrapper}>
                    <Text style={styles.heading}>Certificate of Completion</Text>
                    <Text style={styles.courseName}>{course_name || 'Quantum Literacy Education'}</Text>
                    <Text style={styles.presentedTo}>Presented To</Text>

                    {/* Spacing between sections */}
                    <Text style={styles.recipientName}>{username}</Text>
                    <Text style={styles.recognition}>
                        In recognition of your dedication and achievement in your ability of learning about
                    </Text>
                    <Text style={styles.bold}>{course_desc}</Text>
                    <Text style={styles.recognitionBottom}>
                        contributing to business growth and client retention.
                    </Text>
                    <Text style={styles.awarded}>Awarded</Text>
                    {/* <Image src="/assets/sqc-logo.png" style={styles.sqc_logo} /> */}
                    <Text style={styles.date}>{date}</Text>
                </View>
            </Page>
        </Document>)
    }
    return (
        <>
            <ConfettiComp dim={dim} />
            <div className='certificate-Download' >
                <Suspense fallback={<LoadingSpinner />}>
                    <PDFViewer innerRef={pdfRef} width={dim.width - 200} height={dim.height - 60}
                        showToolbar={false}>
                        {<CertificateDoc />}
                    </PDFViewer>
                </Suspense>
                <div className="action-buttons">
                    <div className="download-button">
                        {course_name && (
                            <div
                                className="download-link">
                                <PDFDownloadLink
                                    document={<CertificateDoc />}
                                    fileName={username + "_" + course_name + ".pdf"}>
                                    {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now')}
                                </PDFDownloadLink>
                            </div>
                        )}
                    </div>
                    <div className="back-button">
                        <Link
                            href={"/learner/certificates"}
                            className="back-link">
                            Back to Certificates
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
};

const ConfettiComp = ({ dim }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    return <Confetti
        numberOfPieces={800}
        gravity={0.2}
        width={dim.width}
        height={dim.height}
        style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 1s ease-out',
        }}
    />
}

export default ThePDF_Container;
