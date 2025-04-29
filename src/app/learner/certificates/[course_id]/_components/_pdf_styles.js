const { StyleSheet } = require("@react-pdf/renderer");

export default StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 0,
  },
  pageBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  contentWrapper: {
    // position: 'absolute',
    // top: '10%',
    // left: '10%',
    // right: '10%',
    width: "100%",
    padding: "10%",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  heading: {
    fontSize: 42,
    fontWeight: "ultrabold",
    fontFamily: "Helvetica",
    marginBottom: 20,
    color: "#2C3E50",
  },
  courseName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2C3E50",
  },
  presentedTo: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#2C3E50",
  },
  recipientName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#2980B9",
  },
  recognition: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 20,
    color: "#34495E",
    fontWeight: "extralight",
  },
  bold: {
    marginTop: 5,
    fontWeight: "ultrabold",
  },
  recognitionBottom: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 5,
    color: "#34495E",
    fontWeight: "extralight",
  },

  awarded: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    // color: '#2C3E50',
    color: "red",
  },
  date: {
    fontSize: 18,
    fontStyle: "italic",
    marginTop: 10,
    color: "red",
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
    objectFit: "contain",
  },
});
