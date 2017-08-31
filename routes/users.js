const express = require('express');
const router = express.Router();
const userModel = require('../models/user_model');
const commonMessage = require('../configs/common_messages.json');
const validator = require('../utilities/string_validator');
const md5 = require('md5');
const cors = require('cors');


router.post('/login', async(req, res) => {
    let entity = req['body']['entity'];
    let password = req['body']['password'];
    if(entity === undefined || password === undefined)
        res.status(200).send(commonMessage.body_body_empty);
    else {
        let isEmail = validator.validateEmail(entity);
        let isNumber = validator.validatePhone(entity);
        try {
            let profile;
            let validMsg;
            if(isEmail){
                profile = await userModel.findEmail(entity);
                validMsg = commonMessage.email_not_valid;
            }else if(isNumber){
                profile = await userModel.findPhoneNumber(entity);
                validMsg = commonMessage.phone_not_valid;
            }else {
                profile = await userModel.findUserName(entity);
                validMsg = commonMessage.username_not_valid;
            }

            if(profile.length <= 0){
                res.status(200).send(validMsg);
            }else {
                profile = profile[0];
                if(profile['Password'] === md5(password)){
                    await userModel.initSession(profile['ID']);
                    let session = await userModel.getSession(profile['ID']);
                    delete profile['Password'];
                    profile['SessionID'] = session;
                    res.status(200).send({success: true, code: "000", message: "berhasil memuat permintaan", profile: profile});
                }else res.status(200).send(validMsg);
            }
        }catch (err){
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}



router.post('/register', async(req, res) => {
    let query = {};
    let entity = req['body']['entity'];
    query['password'] = req['body']['password'];
    query['name'] = req['body']['name'];
    query['username'] = req['body']['username'];
    if(entity === undefined || query['password'] === undefined
        || query['name'] === undefined || query['username'] === undefined)
        res.status(200).send(commonMessage.body_body_empty);
    try {
        let findPhone = [], findemail = [], validMsg;
        if (validator.validatePhone(entity)) {
            query['phonenumber'] = entity;
            query['email'] = 'N/A';
            findPhone = await userModel.findPhoneNumber(query['phonenumber']);
            validMsg = commonMessage.phone_already;
        } else if (validator.validateEmail(entity)) {
            query['phonenumber'] = 'N/A';
            query['email'] = entity;
            findemail = await userModel.findEmail(query['email']);
            validMsg = commonMessage.email_already;
        }
        if(findemail.length > 0 || findPhone.length > 0) res.status(200).send(validMsg);
        else {
            let findusername = await userModel.findUserName(query['username']);
            if(findusername.length > 0) res.status(200).send(commonMessage.username_already);
            else {
                await userModel.insertUser(query);
                res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});
            }
        }
    }catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }
});

router.post('/register-security', async(req, res) => {
    let query = {};
    let entity = req['body']['entity'];
    query['password'] = req['body']['password'];
    query['name'] = req['body']['name'];
    query['idSecurity'] = req['body']['idSecurity'];

    if(entity === undefined || query['password'] === undefined || query['name'] === undefined )
        res.status(200).send(commonMessage.body_body_empty);
    else {
        try {
            let findPhone = [], findemail = [], validMsg;
            if (validator.validatePhone(entity)) {
                query['phonenumber'] = entity;
                query['email'] = 'N/A';
                findPhone = await userModel.findPhoneNumber(query['phonenumber']);
                validMsg = commonMessage.phone_already;
            } else if (validator.validateEmail(entity)) {
                query['phonenumber'] = 'N/A';
                query['email'] = entity;
                findemail = await userModel.findEmail(query['email']);
                validMsg = commonMessage.email_already;
            }
            if(findemail.length > 0 || findPhone.length > 0) res.status(200).send(validMsg);
            else {
                let findIdSecurity = await userModel.findUserName(query['idSecurity']);
                if(findIdSecurity.length > 0) res.status(200).send(commonMessage.plat_already);
                else {
                    await userModel.insertUserSecurity(query);
                    res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});
                }
            }
        }catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});


router.post('/status', async(req, res) => {
    let query = req.body;
    if(query['session_id'] === undefined){
        res.status(200).send(commonMessage.body_body_empty);
    }else {
        try{
            let profile = await userModel.checkSession(query['session_id']);
            if(profile === null) res.status(200).send(commonMessage.session_invalid);
            else {
                res.status(200).send({success: true, code: '0000', message: "Sesion Anda valid"});
            }
        }catch (err){
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});



module.exports = router;
