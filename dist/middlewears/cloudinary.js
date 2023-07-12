var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const cloudinary = require('cloudinary');
require('dotenv').config();
//CLOUDINARY SETUP
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const uploadToCloudinary = (path, folder) => {
    return cloudinary.v2.uploader.upload(path, { folder })
        .then((data) => {
        return { url: data.url, public_id: data.public_id };
    })
        .catch((error) => {
        console.log(error);
    });
};
const removeFromCloudinary = (public_id) => __awaiter(this, void 0, void 0, function* () {
    yield cloudinary.v2.uploader.destroy(public_id, (error, result) => {
        console.log(result, error);
    });
});
module.exports = { uploadToCloudinary, removeFromCloudinary };
