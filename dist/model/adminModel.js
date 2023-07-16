const admin_mongoose = require('mongoose');
const Schema = admin_mongoose;
const Admin_mongoose = new admin_mongoose.Schema({
    revenue: { type: Number }
});
module.exports = admin_mongoose.model("Admin", Admin_mongoose);
