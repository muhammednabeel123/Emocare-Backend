"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../model/tokenModel');
const cryptos = require("crypto");
const User = require('../model/userModel');
const Service = require('../model/serviceModel');
const Counselor = require('../model/counselorModel');
const SendEmail = require("../utilities/sendmail");
const Appointment = require("../model/appointmentModel");
const Admin = require("../model/adminModel");
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary');
dotenv.config();
//
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("hey there ");
        const a_email = process.env.ADMIN;
        const a_password = process.env.ADMINPASS;
        const { email, password } = req.body;
        if (email.trim() === a_email.trim() && password.trim() === a_password.trim()) {
            const token = jwt.sign({ _id: "1234567890" }, "secret");
            res.cookie("adminLog", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
            console.log(token, "this token");
            res.json({ message: true });
        }
        else {
            res.json({ message: false });
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const user = yield User.find({});
            if (!user) {
                return res.status(404).send({ message: 'no users found' });
            }
            else {
                res.send(user);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const user = yield User.findById({ _id: req.params.id });
            if (user.is_blocked) {
                user.is_blocked = false;
                yield user.save();
                res.send({ message: "success" });
            }
            else {
                user.is_blocked = true;
                yield user.save();
                res.send({ message: 'failed' });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });
    }
});
const getCounselor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const counselor = yield Counselor.find({}).populate('service');
            if (!counselor) {
                return res.status(404).send({ message: 'No users found' });
            }
            else {
                res.status(200).send(counselor);
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });
    }
});
const blockCounselor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counselor = yield Counselor.updateOne({ _id: req.params.id }, { $set: { is_Blocked: true } });
        res.status(200).send({ message: "Counselor blocked successfully" });
    }
    catch (error) {
        res.status(500).send({ message: 'An error occurred' });
    }
});
const unblockCounselor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counselor = yield Counselor.updateOne({ _id: req.params.id }, { $set: { is_Blocked: false } });
        res.status(200).send({ message: "Counselor unblocked successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });
    }
});
const AcceptCounselor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const id = req.body.id;
            const counselor = yield Counselor.findById({ _id: id });
            function generateSimilarPassword(existingPassword) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let similarPassword = '';
                for (let i = 0; i < existingPassword.length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    const existingChar = existingPassword.charAt(i);
                    similarPassword += Math.random() < 0.5 ? existingChar : characters.charAt(randomIndex);
                }
                return similarPassword;
            }
            const existingPassword = counselor.password;
            const name = counselor.name;
            const salt = yield bcrypt.genSalt(10);
            const hashedPassword = yield bcrypt.hash(existingPassword, salt);
            const url = `${process.env.BASE_URL2}/counselor`;
            yield SendEmail(counselor.email, "Your accound has been accepted", name, existingPassword, url);
            yield Counselor.findByIdAndUpdate({ _id: id }, { $set: { is_verified: true, password: hashedPassword } });
            res.status(200).send({ message: "successfull" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });
    }
});
const DeclineCounselor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counselor = yield Counselor.findByIdAndDelete(req.params.id);
        console.log(counselor, "this is counelor");
        if (!counselor) {
            return res.status(404).json({ message: 'Counselor not found' });
        }
        yield SendEmail(counselor.email, "Request Declined", `your email is ${counselor.email} is declined please send the request again!! `);
        res.json({ message: 'Counselor deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const addService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const { name, description } = req.body;
            const image = req.file.path;
            const image1 = yield uploadToCloudinary(image, "services");
            const services = new Service({
                name: name,
                description: description,
                Image: image1.url,
                Image_publicId: image1.public_id
            });
            const result = yield services.save();
            res.json({ message: 'request submitted successfully' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const services = yield Service.find({});
            if (!services) {
                return res.send({ message: 'no services recieved' });
            }
            res.send(services);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const getCookie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("here");
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (claims) {
            res.json({ isAuthenticated: true });
        }
        else {
            res.json({ isAuthenticated: false });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const getAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const appointments = yield Appointment.find({}).populate('user').populate('counselor').populate('service').
                sort({ consultingTime: 1 });
            console.log(appointments, "hey there");
            res.json(appointments);
        }
    }
    catch (error) {
        console.log(error);
    }
});
const getRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['adminLog'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const revenue = yield Admin.find({});
            res.json(revenue);
        }
    }
    catch (error) {
        console.log(error);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("adminLog", "", { maxAge: 0 });
    res.send({
        message: "success"
    });
});
module.exports = {
    adminLogin, getUsers, blockUser, getCounselor, blockCounselor, unblockCounselor, AcceptCounselor, DeclineCounselor, addService,
    getServices, getCookie, logout, getAppointment, getRevenue
};
