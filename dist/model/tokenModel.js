const tokenmongoose = require("mongoose");
const Schema = tokenmongoose.Schema;
const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now(), expires: 3600 }
});
module.exports = tokenmongoose.model("token", tokenSchema);
