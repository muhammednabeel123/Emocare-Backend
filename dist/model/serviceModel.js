const s_mongoose = require("mongoose");
const Schema = s_mongoose.Schema;
const serviceSchema = new Schema({
    name: {
        type: String,
    },
    Image: {
        type: String
    },
    description: {
        type: String
    },
    Image_publicId: {
        type: String
    }
});
module.exports = s_mongoose.model('Service', serviceSchema);
