import mongoose, { Schema, type Model } from "mongoose";

/**
 * Uploaded images (logo, hero, doctor photo, gallery…) stored in MongoDB.
 * Images are resized in the browser before upload, so each is usually 100–400 KB.
 * Served publicly at /api/images/<id>.
 */
const ImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    folder: { type: String, default: "" },
  },
  { timestamps: true },
);

export type ImageDoc = {
  _id: mongoose.Types.ObjectId;
  data: Buffer;
  contentType: string;
  size: number;
  folder: string;
};

export const ImageModel: Model<ImageDoc> =
  (mongoose.models.Image as Model<ImageDoc>) || mongoose.model<ImageDoc>("Image", ImageSchema);
