import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { getMediaBucket } from './media.service';

const getMedia = catchAsync(async (req, res, next) => {
  const mediaId = req.params.mediaId as string;

  if (!Types.ObjectId.isValid(mediaId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid media ID');
  }

  const id = new Types.ObjectId(mediaId);
  const bucket = getMediaBucket();
  const [file] = await bucket.find({ _id: id }).limit(1).toArray();

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'Media not found');
  }

  const contentType =
    typeof file.metadata?.contentType === 'string'
      ? file.metadata.contentType
      : 'application/octet-stream';
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.filename)}"`);

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const requestedEnd = match?.[2] ? Number(match[2]) : file.length - 1;
    const end = Math.min(requestedEnd, file.length - 1);

    if (!match || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end) {
      res.setHeader('Content-Range', `bytes */${file.length}`);
      res.status(httpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).end();
      return;
    }

    res.status(httpStatus.PARTIAL_CONTENT);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
    res.setHeader('Content-Length', end - start + 1);
    const stream = bucket.openDownloadStream(id, { start, end: end + 1 });
    stream.on('error', next);
    stream.pipe(res);
    return;
  }

  res.setHeader('Content-Length', file.length);
  const stream = bucket.openDownloadStream(id);
  stream.on('error', next);
  stream.pipe(res);
});

export const MediaController = { getMedia };
