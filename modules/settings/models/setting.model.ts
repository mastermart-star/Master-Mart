import mongoose, { Schema, model, models } from "mongoose";

export interface ISetting extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: string; // JSON-serialized payload
  createdAtUtc: Date;
  updatedAtUtc: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAtUtc", updatedAt: "updatedAtUtc" } }
);

export const SettingModel =
  (models.Setting as mongoose.Model<ISetting>) ??
  model<ISetting>("Setting", SettingSchema, "Setting");
