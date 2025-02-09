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

  const options = {
    maxWidthOrHeight: 800,
    maxSizeMB: 0.5,
    useWebWorker: true,
  };

  try {
    console.log("Starting image upload process...");

    const compressedFile = await imageCompression(file, options);
    console.log("Compressed file ready for upload:", compressedFile);

    if (profileData.profileImage) {
      const oldPublicId = profileData.profileImage.split("/").pop().split(".")[0];
      console.log("Deleting old profile picture with public_id:", oldPublicId);
      await deleteProfilePicture(oldPublicId);
    }

    const formData = new FormData();
    formData.append("file", compressedFile);

    const cloudName = process.env.REACT_APP_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Cloud name or upload preset is missing!");
      return;
    }

    formData.append("upload_preset", uploadPreset);

    setUploading(true);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await axios.post(uploadUrl, formData);

    const imageUrl = response.data.secure_url;
    const transformedImageUrl = `${imageUrl}?c_crop=fill,w_1080,h_1080,q_auto,f_auto`;
    console.log("Uploaded and transformed image URL:", transformedImageUrl);

    setProfileData((prev) => {
      const updatedProfileData = { ...prev, profileImage: transformedImageUrl };
      console.log("Updated profile data:", updatedProfileData);
      return updatedProfileData;
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("Updating Stream profile for user:", currentUser.uid);
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
    const response = await fetch("http://localhost:5000/stream/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profileImage: imageUrl }),
    });

    const data = await response.json();
    if (!data.success) {
      console.error("Failed to update Stream profile:", data.error);
    } else {
      console.log("Stream profile updated successfully.");
    }
  } catch (err) {
    console.error("Error updating Stream profile:", err);
  }
};
