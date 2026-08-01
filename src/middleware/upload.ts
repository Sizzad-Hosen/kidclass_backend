import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

// Course videos may be larger than the general attachment limit. The lesson
// service persists them outside MongoDB and only stores the resulting URL.
export const uploadCourseVideo = multer({ storage });
