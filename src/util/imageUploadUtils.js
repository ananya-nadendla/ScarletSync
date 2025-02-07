// utils/imageUploadUtils.js
import axios from "axios";
import imageCompression from "browser-image-compression";
import { StreamChat } from "stream-chat";
import { auth } from "../config/firebase"; // Import Firebase auth to get the current user ID

// Method to delete the old profile picture from Cloudinary
// Method to delete the old profile picture from Cloudinary
export const deleteProfilePicture = async (publicId) => {
    const cloudName = process.env.REACT_APP_CLOUD_NAME;

    if (!cloudName) {
        console.error("Cloud name is missing!");
        return;
    }

    try {
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
        const data = {
            public_id: publicId, // The public_id of the image to delete
        };

        const response = await axios.post(url, data);
        console.log("Deleted old profile picture:", response.data);
    } catch (err) {
        console.error("Error deleting profile picture:", err);
    }
};


// Method to handle image upload
export const handleImageUpload = async (file, setUploading, setProfileData, profileData = {}) => {
    if (!file) return;

    // Compress the image using browser-image-compression
    const options = {
        maxWidthOrHeight: 800, // Max width or height of the compressed image (adjust as needed)
        maxSizeMB: 0.5, // Maximum file size in MB (adjust as needed)
        useWebWorker: true, // Use web workers for better performance
    };

    try {
        // Compress the image
        const compressedFile = await imageCompression(file, options);
        console.log("Compressed file:", compressedFile);

        // If there's an existing profile picture, delete it first
        if (profileData.profileImage) {
            const oldPublicId = profileData.profileImage.split("/").pop().split(".")[0]; // Extract public_id from the URL
            console.log("Deleting old profile picture with public_id:", oldPublicId);
            await deleteProfilePicture(oldPublicId); // Delete the old profile picture
        }

        // Create FormData for uploading
        const formData = new FormData();
        formData.append("file", compressedFile);

        // Cloudinary settings
        const cloudName = process.env.REACT_APP_CLOUD_NAME;
        const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.error("Cloud name or upload preset is missing!");
            return;
        }

        formData.append("upload_preset", uploadPreset); // Use the preset from .env

        // Upload to Cloudinary
        setUploading(true);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const response = await axios.post(uploadUrl, formData);

        // Get the image URL from Cloudinary response
        const imageUrl = response.data.secure_url;
        console.log("Uploaded new image:", imageUrl);

        // Apply Cloudinary transformations: crop to square, resize, compress
        const transformedImageUrl = `${imageUrl}?c_crop=fill,w_1080,h_1080,q_auto,f_auto`;
        console.log("Transformed image URL:", transformedImageUrl);

        // Update profile data with the transformed image URL
        setProfileData((prev) => {
            const updatedProfileData = { ...prev, profileImage: transformedImageUrl };
            console.log("Updated profile data:", updatedProfileData);
            return updatedProfileData;
        });

        // ✅ Update Stream Chat Profile Picture
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await updateStreamProfilePicture(currentUser.uid, transformedImageUrl);
                }
    } catch (err) {
        console.error("Error uploading or compressing image:", err);
    } finally {
        setUploading(false);
    }
};


// ✅ Function to update Stream Chat profile picture
const updateStreamProfilePicture = async (userId, imageUrl) => {
    try {
        const streamClient = StreamChat.getInstance(process.env.REACT_APP_STREAM_API_KEY);

        if (!streamClient || !userId) {
            console.error("Stream client is not initialized or user ID is missing.");
            return;
        }

        console.log("🔄 Updating Stream Chat profile picture...");
        await streamClient.partialUpdateUser({
            id: userId,
            set: { image: imageUrl },
        });

        console.log("✅ Stream profile picture updated successfully!");
    } catch (err) {
        console.error("❌ Error updating Stream profile picture:", err);
    }
};