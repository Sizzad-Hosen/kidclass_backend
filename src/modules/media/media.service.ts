import { once } from 'events';
import mongoose, { mongo } from 'mongoose';
import { env } from '../../config/env';

const bucketName = 'kidclassMedia';

export const getMediaBucket = () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('Database connection is not ready');
  }

  return new mongo.GridFSBucket(database, { bucketName });
};

export const uploadMedia = async (file: Express.Multer.File, folder: string) => {
  const bucket = getMediaBucket();
  const filename = `${folder}/${crypto.randomUUID()}-${file.originalname}`;
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      contentType: file.mimetype,
      originalName: file.originalname
    }
  });

  uploadStream.end(file.buffer);
  await once(uploadStream, 'finish');

  return uploadStream.id.toString();
};

export const mediaUrl = (mediaId: string) => {
  const baseUrl = (env.PUBLIC_BASE_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '');
  return `${baseUrl}/api/v1/media/${mediaId}`;
};
