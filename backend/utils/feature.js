import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import { getBase64, getSockets } from "../lib/helper.js";
import { ApiError } from "./ApiError.js";
import fs from "fs";

const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const userSocket = getSockets(users);
  io.to(userSocket).emit(event, data);
};

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });
  try {
    const results = await Promise.all(uploadPromises);
    if (!results) {
      throw new ApiError(400, `Image not uploading ${this.message}`);
    }
    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (error) {
    throw new ApiError(
      404,
      `Error : while uploading image to cloudinary ${error.message}`
    );
  }
};

const deleteFilesFromCloudinary = async (public_ids) => {
  // delete files from cloudinary...
  const deletePromises = public_ids.map((public_id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        console.log(`File deleted: ${public_id}`);
        resolve(result);
      });
    });
  });
};

export { deleteFilesFromCloudinary, emitEvent, uploadFilesToCloudinary };
