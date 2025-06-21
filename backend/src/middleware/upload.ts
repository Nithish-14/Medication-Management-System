import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const fileFilter = function (_req: any, file: any, cb: any) {
    if (file.mimetype === 'image/jpeg') { // Check if file is JPEG image
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only JPG files are allowed')); // Reject the file
    }
};


const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
     const ext = path.extname(file.originalname);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `medication-${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter, 
    limits: {
        fileSize: 2097152 //2MB limit
    }
})

export default upload;
