import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
export const Upload = multer({
    storage: storage,
    limits: {fileSize: 15 * 1024 * 1024},
    fileFilter: async (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
            return cb(null, true);
        } else {
            cb(new Error("Invalid file"), true);
        }
    },
});

export const UploadSound = multer({
    storage: storage,
    limits: {fileSize: 15 * 1024 * 1024},
    fileFilter: async (req, file, cb) => {
        const allowedMimeTypes = ['audio/wave', 'audio/mpeg'];
        const allowedExtensions = ['.wav', '.mp3'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
            return cb(null, true);
        } else {
            cb(new Error("Invalid file"), true);
        }
    },
});
