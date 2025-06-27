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

export const UploadVideo = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'video/mp4',         // .mp4
            'video/quicktime',   // .mov
            'video/x-m4v'        // .m4v
        ];

        const allowedExtensions = ['.mp4', '.mov', '.m4v'];

        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video format'), false);
        }
    }
});