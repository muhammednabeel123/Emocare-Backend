const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const Token = require('../model/tokenModel')
const SendEmail = require("../utilities/sendmail")
const Counselor = require('../model/counselorModel')
const moment = require('moment');
const Appointment = require('../model/appointmentModel')
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary')
const cryptos = require("crypto")
import jwt_decode from "jwt-decode";
import * as dotenv from "dotenv";
import jwtDecode from "jwt-decode"
dotenv.config();


const userRegistration = async (req, res) => {
    try {

        let email = req.body.email
        let password = req.body.password
        let name = req.body.name
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const record = await User.findOne({ email: email })

      
        if (record) {return res.status(400).send({message: "Email is already registered" }) } 
        else {const user = new User({name: name,email: email,password: hashedPassword })

        const result = await user.save()

        const emailtoken = await new Token({ userId: result._id,token: cryptos.randomBytes(32).toString("hex") }).save()
        
        const url = `${process.env.BASE_URL2}/user/${result._id}/verify/${emailtoken.token}`

        await SendEmail(user.email, "verify email",name,password, url)
        const { _id } = await result.toJSON()
        res.status(201).send({ message: "mail sented",token: emailtoken.token, userId: user._id });}
        
      } catch (error) {
        console.log(error);

    }
}

const mailVerify = async (req, res) => {
    try {
    
        
        const user = await User.findOne({ _id:req.params.id });

        if (!user) return res.status(404).send({ message: "Invalid link" })
        const tokens = jwt.sign({ _id: req.params.id }, "secret")

        res.cookie("userReg", tokens, { httpOnly: true,maxAge: 24 * 60 * 60 * 1000})
        
        const token = await Token.findOne({userId: user._id,token: req.params.token })

        if (!token) return res.status(400).send({ message: "invalid link" })
        await User.updateOne({ _id: user._id }, { $set: { verified: true } })

        await Token.deleteOne({ token: req.params.token })

        res.status(200).send({ message: 'Verification successful' })


    } catch (error) {
        res.status(500).send({ message: "Internals Server Error" })
    }
}

const getUser = async (req, res) => {

    try {  
        const {_id} = req.user
        const user = await User.findOne({ _id:_id })
        const { password, ...data } = await user.toJSON()
        res.status(200).send(data)

    } catch (error) {
        console.log(error);   
    }

}

const login = async (req, res) => {
   
    const user = await User.findOne({ email: req.body.email });  
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (user.is_blocked) {
      return res.status(400).send({ message: 'Forbidden' });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send({ message: 'Password is incorrect' });
    }

    const token = jwt.sign({ _id: user._id }, 'secret');
    res.cookie('userReg', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
  
    res.status(200).send({ message: 'Login successful',token: token });
  };

const logout = async (req, res) => {
  
    
    res.cookie("userReg", "", { maxAge: 0 })
    res.send({
        message: "success"
    })

}
const servicesById = async(req,res)=>{
    try {
        const counselors = await Counselor.find({ service: req.params.id })
        res.send(counselors);            
    } catch (error) {
        console.log(error);
                
    }
}

//TIME BOOKIN SLOT CREATION
const slotes = [];


const startTime = moment().startOf('day').hour(0);
const endTime = moment().startOf('day').hour(24);

const slotDuration = 1; // in hours

while (startTime.isBefore(endTime, 'hour')) {
    const currentTime = moment();
    const slotTime = moment(startTime);

  const slot = {
    startTime: startTime.format('hh:mm A'),
    booked: false,
    expired: false,
    servicer:null
  };
  slotes.push(slot);

  startTime.add(slotDuration, 'hours');
}

const slots = async (req, res) => {
  try {

    const availableSlots = slotes
    res.json(availableSlots);
  } catch (error) {
    console.log(error);
  }
};

const bookSlot = async (req, res) => {
  try {


    const { slotId, serviceId, userId } = req.params;
    const { stripeToken, appointmentId } = req.query;
    const { wallet } = req.body;

    
   
    if (req.body.wallet  >= 0) {
      await User.findByIdAndUpdate(
        userId,
        { wallet: req.body.wallet },
        { new: true }
      ); 
     }
  

   if(appointmentId != undefined ){
    try {
     
        
        const modifiedAppointmentId = appointmentId.slice(1, -1)   
        const foundAppointment = await Appointment.findOne({ _id:appointmentId });
         if (foundAppointment) {
          const extractedSlotId = foundAppointment.slotId;
          const slot = slotes[extractedSlotId];
          slot.servicer = null
          slot.booked = false;

          await Appointment.deleteOne({ _id: appointmentId});    
        } else {
          throw new Error('Appointment not found');
        }
      } catch (error) {
        console.error('Error:', error);
      
      }
   }
    

    
    

    
const slot_id = slotId;
const slot = slotes[slotId];
const customer = await User.findOne({ _id: userId });
const counselor = await Counselor.findOne({ _id: serviceId });
const timeString = slot.startTime;
const date = new Date();
const timeComponents = timeString.split(':');
let hour = parseInt(timeComponents[0]);
const minute = parseInt(timeComponents[1].split(' ')[0]);
const period = timeComponents[1].split(' ')[1].toUpperCase();

if (req.body.wallet) {
  await User.findByIdAndUpdate(userId, { wallet: req.body.wallet }, { new: true });
}

if (period === 'PM' && hour !== 12) {
  hour += 12;
} else if (period === 'AM' && hour === 12) {
  hour = 0;
}

date.setHours(hour);
date.setMinutes(minute);

const formattedDateTime = new Date('2023-07-27T12:30:00+05:30');
formattedDateTime.setHours(hour, minute, 0, 0);


const booking = new Appointment({
  user: customer._id,
  counselor: counselor._id,
  service: counselor.service,
  booked: true,
  fee: counselor.fee,
  consultingTime: formattedDateTime,
  slotId: slot_id,
  date: new Date()
});

const result = await booking.save();



    if (!slot || slot.booked || slot.expired || slot.servicer ) {
      res.status(400).send({ error: 'Invalid or unavailable slot' });
    } else {
      slot.booked = true;
      slot.servicer = result.counselor
     
     
      setTimeout(() => {
        slot.expired = true;
      }, 60 * 60 * 1000); 

      res.json({ message: 'Slot booked successfully' });
    }
  } catch (error) {
    console.log(error,);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDate = async(req,res) =>{
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        res.json({date:currentDate})

    } catch (error) {
        console.log(error);
        
    }
}

const getServicer = async(req,res)=>{
    try {

       const servicer = await Counselor.findById({_id:req.params.id}).populate('service')
       res.json(servicer)

    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
        console.log(error);

        }
}

const getAppointment = async(req,res)=>{
    try { 
          const{_id} = req.user
          const appointments = await Appointment.find({ user:_id }).populate('user').populate('counselor').populate('service').
          sort({ consultingTime: 1 });
          res.json(appointments);
            
    } catch (error) {
        console.log(error)    
    }
}  

const cancelAppointment = async(req,res)=>{
    try {
     
            const appointmentId = req.params.id;
            const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, { canceled: true, payment_status: 'refunded' }, { new: true });
            if (!updatedAppointment) {
              return res.status(404).send({
                message: "Appointment not found"
              });
            }
            const slotId = updatedAppointment.slotId;
            const userId = updatedAppointment.user; 
            const slot = slotes[slotId];
            slot.servicer = null
            slot.booked = false;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send({
                  message: "User not found"
                });
              }   
              user.wallet += updatedAppointment.fee;
              await user.save();
              const slotIdToReturn = slotId;
          
            res.status(200).send({
              message: "Appointment canceled successfully",
              slotId: slotIdToReturn
            });
          }  
       

        
     catch (error) {
        console.log(error);
        
        
    }
}

const editProfile = async (req,res) => {
  try {
    
      
      const { name, email, oldPassword, newPassword ,Image } = req.body  
      const {_id} = req.user
          
      const file = req.file;

      
      const user = await User.findOne({ _id:_id  })

      let hashedPassword1 = user.password;
      if (oldPassword != 'undefined' && oldPassword !== '') {
        const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordMatched) {
          return res.status(400).json({ error: 'Incorrect Password' });
        }

        if (newPassword != 'undefined' && newPassword !== '') {
          const salt = await bcrypt.genSalt(10);
          hashedPassword1 = await bcrypt.hash(newPassword, salt);
        }
      }

      if(req.file !== undefined ){
      const image = req.file.path  
      const image1 = await uploadToCloudinary(image,"profile")
      const updated = await User.updateOne({ _id: _id }, { $set:{name:name,password:hashedPassword1,Image:image1.url,profile_PublicId:image1.public_id} })
      return res.json({ message: 'User profile updated successfully' });
      }
      if (newPassword == 'undefined' || newPassword === '') {  
          
          await User.updateOne(
            { _id:_id },
            { $set: { name: name } }
          );
        } else {
          await User.updateOne(
            { _id:_id },
            { $set: { name: name, password: hashedPassword1 } }
          );
        }
        return res.json({ message: 'User profile updated successfully' });
      
      } catch (error) {
          console.log(error)
       }
  
}

interface DecodedToken {
  email: string;
  name:string;
  picture:string
  // Add other properties if needed
}

const googleLogin = async(req,res)=>{
  try {

      const decoded = jwtDecode(req.body.credential) as DecodedToken;
      const email = decoded.email 
      const userData = await User.findOne({email:email})

      if(userData?.is_Blocked){
       return res.status(201).json({ message: "You are blocked by admin", status: false });
      }

      if(userData){ 
        const token = jwt.sign({ _id: userData._id }, 'secret'); 
        res.cookie('userReg', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
        return res.status(200).send({ message: 'Login successful',token: token });
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(decoded.name, salt)
      const user =  new User({
        name:decoded.name,
        email: decoded.email,
        password:hashedPassword,
        Image:decoded.picture
      })
    
      await user.save()

      const token = jwt.sign({ _id: user._id }, 'secret'); 
      res.cookie('userReg', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
      return res.status(200).send({ message: 'Login successful',token: token });
      
  } catch (error) {
    console.log(error);
    
  }
}




module.exports = {
    userRegistration,
    getUser, logout, login, mailVerify,servicesById,slots,bookSlot,getServicer,getDate,getAppointment,cancelAppointment,editProfile,
    googleLogin
}