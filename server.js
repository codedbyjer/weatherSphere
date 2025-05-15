require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5500;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ✅ Correct static directory setup
const publicPath = path.join(__dirname);
app.use(express.static(publicPath));

// ✅ Serve the index.html correctly
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Handle Contact Form Submission
app.post("/send-email", async (req, res) => {
    const { userName, userEmail, userMessage } = req.body;

    if (!userName || !userEmail || !userMessage) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        await transporter.sendMail({
            from: `"${userName}" <${userEmail}>`,
            to: process.env.EMAIL_USER, // Admin Email
            subject: "New Contact Form Submission",
            text: userMessage,
            html: `<p><strong>Name:</strong> ${userName}</p>
                   <p><strong>Email:</strong> ${userEmail}</p>
                   <p><strong>Message:</strong> ${userMessage}</p>`,
        });

        res.status(200).json({ success: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send the message. Please try again later." });
    }
});

// ✅ Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at: http://localhost:${PORT}`);
});
