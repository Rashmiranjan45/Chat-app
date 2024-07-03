import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import { getBase64 } from "../lib/helper.js";
import { ApiError } from "./ApiError.js";

const emitEvent = (req, event, users, data) => {
  console.log("emiting event", event);
};

const uploadFilesToCloudinary = async (files=[]) => {
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
    console.log("public_id length:", results.public_id.length);
    console.log("secure_url length:", results.secure_url.length);
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
}

const deleteFilesFromCloudinary = async (public_ids) => {
  // delete files from cloudinary...
};

export { deleteFilesFromCloudinary, emitEvent, uploadFilesToCloudinary };