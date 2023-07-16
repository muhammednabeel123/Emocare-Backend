const a_mongoose = require('mongoose')
const Schema = a_mongoose.Schema

const A_mongoose = new a_mongoose.Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User', },
    counselor: { type: Schema.Types.ObjectId, required: true, ref: 'Counselor', },
    service: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    booked: { type: Boolean, default: false },
    consultingTime: { type: Date, required: true },

    slotId: { type: String },
    fee: { type: Number },
    payment_status: { type: String, default: 'completed' },
    canceled: { type:Boolean  },
    date: Date,
    expired: { type: Boolean },
    completed:{ type:Boolean ,default:false },
    duration:{type:String},
    available:{type:String}

})

module.exports = a_mongoose.model("Appointment", A_mongoose)