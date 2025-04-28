"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Font, Image, PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import Confetti from 'react-confetti';
import Link from 'next/link';

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-800.ttf', fontWeight: 800 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-400.ttf', fontWeight: 400 }
    ]
});

const ThePDF_Container = ({ data }) => {
    const pdfRef = useRef()
    const username = `${data.user.firstName} ${data.user.lastName}`;
    const course_name = data.data.course_id.course_name
    const date = formatDate(data.data.updatedAt)
    function formatDate(time) {
        const fullTimeData = new Date(time)
        return fullTimeData.toDateString()
    }
    const CertificateDoc = () => (<Document>
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
                    In recognition of your dedication and achievement in enhancing your ability to
                </Text>
                <Text style={styles.bold}>engage customers, drive sales, and provide exceptional support,</Text>
                <Text style={styles.recognitionBottom}>
                    contributing to business growth and client retention.
                </Text>
                <Text style={styles.awarded}>Awarded</Text>
                <Image src="/assets/mj-logo.png" style={styles.mjLogo} />
                {/* <Image src="/assets/sqc-logo.png" style={styles.sqc_logo} /> */}
                <Text style={styles.date}>{date}</Text>
            </View>
        </Page>
    </Document>)
    return (
        <>
            <ConfettiComp />
            <div className='certificate-Download' >
                <PDFViewer innerRef={pdfRef} width={window.innerWidth - 200} height={window.innerHeight - 60}
                    showToolbar={false}>
                    {<CertificateDoc />}
                </PDFViewer>
                <div className="action-buttons">
                    <div className="download-button">
                        {course_name && (
                            <a
                                className="download-link">
                                <PDFDownloadLink
                                    document={<CertificateDoc />}
                                    fileName={username.replace(/\s+/g, '_') + course_name + ".pdf"}>
                                    {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now')}
                                </PDFDownloadLink>
                            </a>
                        )}
                    </div>
                    <div className="back-button">
                        <Link
                            href={"/training/certificates"}
                            className="back-link">
                            Back to Certificates
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
};

const ConfettiComp = () => {
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
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 1s ease-out',
        }}
    />
}

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 0,
    },
    pageBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    contentWrapper: {
        // position: 'absolute',
        // top: '10%',
        // left: '10%',
        // right: '10%',
        width: "100%",
        padding: "10%",
        textAlign: 'center',
        fontFamily: 'Helvetica',
    },
    heading: {
        fontSize: 42,
        fontWeight: "ultrabold",
        fontFamily: 'Helvetica',
        marginBottom: 20,
        color: '#2C3E50',
    },
    courseName: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2C3E50',
    },
    presentedTo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#2C3E50',
    },
    recipientName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#2980B9',
    },
    recognition: {
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 20,
        color: '#34495E',
        fontWeight: "extralight"
    },
    bold: {
        marginTop: 5,
        fontWeight: "ultrabold"
    },
    recognitionBottom: {
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 5,
        color: '#34495E',
        fontWeight: "extralight"
    },

    awarded: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        // color: '#2C3E50',
        color: "red"
    },
    date: {
        fontSize: 18,
        fontStyle: 'italic',
        marginTop: 10,
        color: "red"

    },
    mjLogo: {
        height: "50px",
        width: "140px",
        position: "absolute",
        left: "50px",
        bottom: "50px",
        // backgroundColor: "#000",
        // border: "1px solid #000"
        // objectFit: 
    },
    sqc_logo: {
        height: "50px",
        width: "120px",
        position: "absolute",
        right: "50px",
        bottom: "50px",
        objectFit: "contain"
    }
});

export default ThePDF_Container;
