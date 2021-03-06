const UserSchema = require('../models/user.model');
const OtpSchema = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config/pass.config');
const nodemailer = require("nodemailer");
const QRCode = require('qrcode');
const e = require('cors');

const generateQR = async text => {
    try {
        let x = await QRCode.toDataURL(text);
        return x;
    } catch (err) {
        console.error(err)
    }
}


exports.login = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    loginHelper(username, password, res);
}

exports.signup = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    signupHelper(username, password, email, res);
}

exports.forgotPass = async (req, res) => {
    let email = req.body.email;
    let userName = req.body.username;
    let newPass = makeid(8);
    try {
        let successJson = await changePassword(userName, email, newPass);
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: 'something happend during changing password'
        });
    }
    try {
        await sendEmail(userName, email, newPass);
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: 'something happend during mailing'
        });
    }
    return res.json({
        success: true,
        message: 'new password email sent'
    });
}

exports.changePass = async (req, res) => {
    let username = req.body.username;
    let newPassword = req.body.newpass;

    let message = await changePassword(username, newPassword);

    return res.json(message);
}

async function sendEmail(userName, email, newPass) {
    let password = require('../../config/email.config');
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "mritwik369@gmail.com", // generated ethereal user
            // pass: password.emailPassword // generated ethereal password
            pass: "yczhlxcsepitueab" // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"SocialDistanceApp" mritwik369@gmail.com', // sender address
        to: email, // list of receivers
        subject: "OTP for SocialDistancing Application", // Subject line
        text: "OTP For App is " + newPass + "."// plain text body
    });

    console.log("Message sent: %s", info.messageId);
}

function genOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function changePassword(username, email, password) {
    const saltRounds = 10;
    let passwordHash;
    let updateUser;
    try {
        passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (err) {
        console.log(err);
        updateUser = {
            success: false,
            message: "Something happened during hashing"
        };
    }

    try {
        updateUser = await UserSchema.findOneAndUpdate({ email: email }, { $set: { password: passwordHash } }, { new: true });
    } catch (err) {
        console.log(err)
        updateUser = {
            success: false,
            message: "email dosen't exist, signup required."
        };
    }
    return (updateUser);
}

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function signupHelper(username, password, email, res) {
    let alreadyPresent;
    try {
        alreadyPresent = await UserSchema.findOne({ email: email });
    } catch (err) {
        console.log(err)
        return res.json({
            success: false,
            message: 'Authorization failed! Some error'
        });
    }
    if (alreadyPresent) {
        return res.json({
            success: false,
            message: 'Authorization failed! Some error'
        });
    } else {
        const saltRounds = 10;
        let passwordHash;
        try {
            passwordHash = await bcrypt.hash(password, saltRounds);
        } catch (err) {
            console.log(err);
        }
        let profile = {
            username: username,
            email: email,
            password: passwordHash
        };
        try {
            let newUser = new UserSchema(profile);
            let data = await newUser.save();
            return res.json({
                success: true,
                message: "User added",
                id: newUser._id,
            });
        } catch (err) {
            console.log(err);
        }
    }
}

async function loginHelper(username, password, res) {
    let alreadyPresent;
    let erro;
    try {
        alreadyPresent = await UserSchema.findOne({ username: username });
    } catch (err) {
        console.log(err)
        erro = err;
    }
    if (alreadyPresent != null) {
        let storedNumber = alreadyPresent.username;
        let storedPassword = alreadyPresent.password;
        let passwordsMatch;
        try {
            passwordsMatch = await bcrypt.compare(password, storedPassword);
        } catch (err) {
            console.log(err);
        }
        if (username === storedNumber && passwordsMatch) {
            let token = jwt.sign({ usernameber: username }, config.secret);
            // return the JWT token for the future API calls
            let successJson = {
                success: true,
                message: 'Authentication successful!',
                token: token,
                id: alreadyPresent._id,
                qr: await generateQR(alreadyPresent._id.toString()),
            };
            console.log(successJson);
            return res.json(successJson);
        } else {
            return res.json({
                success: false,
                message: 'Incorrect username or password'
            });
        }
    } else {
        return res.json({
            success: false,
            message: 'Incorrect username or password'
        });
    }
}

exports.generateOtp = async (req, res) => {
    let otp = genOTP();
    try {
        await sendEmail("", req.body.email, otp);
        await OtpSchema.findOneAndUpdate({
            email: req.body.email
        }, { otp }, {
            upsert: true
        });
        return res.json({
            success: true,
            message: "OTP sent!"
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Service issue'
        });
    }
}

exports.validateOtp = async (req, res) => {
    try {
        let object = await OtpSchema.findOne({
            email: req.body.email
        });

        if (object)
            if (object.otp == req.body.otp)
                return res.json({
                    success: true,
                    message: "Verified!"
                });

        return res.json({
            success: false,
            message: "Otp invalid"
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Service Issue'
        });
    }
}