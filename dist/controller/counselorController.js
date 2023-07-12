var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Counselor = require('../model/counselorModel');
const Services = require('../model/serviceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../model/tokenModel');
const Appointment = require('../model/appointmentModel');
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary');
//  COUNSELOR SIGNUP
const signup = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { name, email, password, state, primaryAddress, profession, country, pincode, experience, age } = req.body;
        const record = yield Counselor.findOne({ email: email });
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            });
        }
        else {
            const id_proof = req.files.idProof[0].path;
            const certificate = req.files.certificate[0].path;
            const image1 = yield uploadToCloudinary(id_proof, "counselor-idproof");
            const image2 = yield uploadToCloudinary(certificate, "counselor-certificate");
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
            });
            const result = yield counselor.save();
            console.log(result);
            res.send({ message: 'success' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
const getServices = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const services = yield Services.find({ is_Blocked: false });
        res.send(services);
    }
    catch (error) {
        console.log(error.message);
    }
});
const counselorLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const user = yield Counselor.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }
        if (user.is_Blocked) {
            return res.status(400).send({ message: 'Forbidden' });
        }
        if (!(yield bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).send({ message: "Password is incorrect" });
        }
        const token = jwt.sign({ _id: user._id }, "secret");
        res.cookie("C-Logged", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
        res.send({ message: "success" });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send({ message: "Internals Server Error" });
    }
});
const getCounselor = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['C-Logged'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        const user = yield Counselor.findOne({ _id: claims._id });
        const _a = yield user.toJSON(), { password } = _a, data = __rest(_a, ["password"]);
        res.status(200).send(data);
    }
    catch (error) {
        console.log(error);
    }
});
const getAppointment = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("here");
        const cookie = req.cookies['C-Logged'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        const appointments = yield Appointment.find({ counselor: claims._id }).populate('user').populate('counselor').populate('service').sort({ consultingTime: 1 });
        console.log(appointments);
        res.json(appointments);
    }
    catch (error) {
        console.log(error);
    }
});
const editAppointment = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const payload = req.body;
        const updatedAppointment = yield Appointment.findOneAndUpdate({ _id: id }, payload, { new: true });
        if (!updatedAppointment) {
            res.status(404).send('Appointment not found');
            return;
        }
        console.log(updatedAppointment, 'threr');
        res.status(200).json({ message: 'Appointment updated successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Error updating appointment');
    }
});
const logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
    res.cookie("C-Logged", "", { maxAge: 0 });
    res.send({
        message: "success"
    });
});
module.exports = {
    signup, getServices, counselorLogin, getCounselor, logout, getAppointment, editAppointment
};
