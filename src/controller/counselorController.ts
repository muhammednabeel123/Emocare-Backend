const Counselor = require('../model/counselorModel')
const Services = require('../model/serviceModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../model/tokenModel')
const Appointment = require('../model/appointmentModel')
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary')



//  COUNSELOR SIGNUP
const signup = async (req, res) => {

    try {

        const { name, email, password, state, primaryAddress, profession, country, pincode, experience, age } = req.body
        const record = await Counselor.findOne({ email: email })
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            })


        } else {
               const id_proof = req.files.idProof[0].path
            const certificate = req.files.certificate[0].path
            const image1 = await uploadToCloudinary(id_proof, "counselor-idproof")
            const image2 = await uploadToCloudinary(certificate, "counselor-certificate")
            const counselor = new Counselor({
                name: name,
                password: password,
                email: email,
                state: state,
                address: primaryAddress,
                service: profession,
                country: country,
                pincode: pincode,
                experience: experience,
                id_proof: image1.url,
                fee: age,
                id_proofPublicId: image1.public_id,
                certificates: image2.url,
                certificatesPublicId: image2.public_id

            })

            const result = await counselor.save()

            console.log(result);



            res.send({ message: 'success' })


        }


    } catch (error) {
        console.log(error.message);

    }
}

const getServices = async (req, res) => {
    try {


        const services = await Services.find({ is_Blocked: false });

        res.send(services)



    } catch (error) {
        console.log(error.message);

    }
}

const counselorLogin = async (req, res) => {
    try {

        console.log(req.body);


        const user = await Counselor.findOne({ email: req.body.email })
        if (!user) {

            return res.status(404).send({ message: 'user not found' })
        }
        if (user.is_Blocked) {
            return res.status(400).send({ message: 'Forbidden' });
        }

        if (!(await bcrypt.compare(req.body.password, user.password))) {

            return res.status(400).send({ message: "Password is incorrect" })
        }
        const token = jwt.sign({ _id: user._id }, "secret")
        res.cookie("C-Logged", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 })
        res.send({ message: "success" })
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send({ message: "Internals Server Error" })
    }
}

const getCounselor = async (req, res) => {
    try {
        const cookie = req.cookies['C-Logged']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await Counselor.findOne({ _id: claims._id })

        const { password, ...data } = await user.toJSON()
        res.status(200).send(data)

    } catch (error) {
        console.log(error);

    }
}

const getAppointment = async (req, res) => {
    try {
        console.log("here");

        const cookie = req.cookies['C-Logged']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const appointments = await Appointment.find({ counselor: claims._id }).populate('user').populate('counselor').populate('service').sort({ consultingTime: 1 });
        console.log(appointments);
        res.json(appointments);

    } catch (error) {
        console.log(error);


    }
}

const editAppointment = async (req, res) => {
    try {

        const id = req.params.id;
        const payload = req.body;

        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: id },
            payload,
            { new: true }
        );

        if (!updatedAppointment) {
            res.status(404).send('Appointment not found');
            return;
        }
        console.log(updatedAppointment, 'threr');


        res.status(200).json({ message: 'Appointment updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error updating appointment');
    }
};




const logout = async (req, res) => {


    res.cookie("C-Logged", "", { maxAge: 0 })
    res.send({
        message: "success"
    })

}



module.exports = {
    signup, getServices, counselorLogin, getCounselor, logout, getAppointment, editAppointment
} 