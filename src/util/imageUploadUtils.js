import axios from "axios";
import imageCompression from "browser-image-compression";

// **UPLOAD IMAGE**
export const handleImageUpload = async (file, setUploading, setProfileData) => {
  setUploading(true);

  try {
    // Simulate the image upload process. Replace with your actual Cloudinary upload logic.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your-upload-preset"); // Make sure to replace with your preset
    const response = await fetch("https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data?.secure_url) {
      // Update profile data with the new image URL
      setProfileData((prevData) => ({
        ...prevData,
        profileImage: data.secure_url,
      }));
    } else {
      throw new Error("Image upload failed.");
    }
  } catch (error) {
    console.error("Image upload failed:", error);
  } finally {
    setUploading(false);
  }
};

// **DELETE IMAGE**
export const deleteProfilePicture = async (publicId) => {
    if (!publicId) return;

    try {
        const response = await axios.post("http://localhost:5000/delete-image", { publicId });
        console.log("Deleted old profile picture:", response.data);
    } catch (err) {
        console.error("Error deleting profile picture:", err);
    }
};
