require("dotenv").config();
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const { v2: cloudinary } = require("cloudinary");
const cors = require("cors");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Multer Middleware
const upload = multer();

// Upload Endpoint
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Received upload request");

        const stream = cloudinary.uploader.upload_stream({ folder: "profile_pictures" }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Error:", error);
                return res.status(500).json({ error: "Cloudinary upload failed" });
            }

            console.log("Cloudinary Upload Success:", result.secure_url);
            res.json({ success: true, imageUrl: result.secure_url });
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
