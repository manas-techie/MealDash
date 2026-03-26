const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary, then delete the temp file.
 * @param {string} localFilePath - Path to the file on disk
 * @param {string} folderName - Cloudinary folder to upload into
 * @returns {object|null} Cloudinary response or null on failure
 */
const uploadOnCloudinary = async (localFilePath, folderName = "mealdash") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName,
        });

        // Upload succeeded — remove temp file
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // Upload failed — still remove temp file to avoid clutter
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload error:", error.message);
        return null;
    }
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * @param {string} publicId - The public_id of the asset to delete
 * @returns {object|null} Cloudinary response or null on failure
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
        return null;
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
