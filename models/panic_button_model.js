const app = require('../app');
const moment = require('moment');
let database = app.db;
let userCollection = database.collection('tb_user');
let sessionCollection = database.collection('tb_session');
let panicButtonCollection = database.collection('tb_panic_button');
let panicButtonHistoryCollection = database.collection('tb_panic_button_history');
const autoIncrement = require("mongodb-autoincrement");
const md5 = require('md5');
const converter = require('../utilities/converter');

/** find list Panic button by id user **/
findByIdUser = (UserID) => {
    return new Promise((resolve, reject)=>{
        panicButtonCollection.find({id_user :parseInt(UserID)}).toArray( (err, results) => {
            if(err)reject(err);
            else resolve(results);
        });
    });
};
/** find list Panic button history by id user **/
findHistoryByIdUser = (UserID) => {
    return new Promise((resolve, reject)=>{
        panicButtonHistoryCollection.find({id_user :parseInt(UserID)}).toArray( (err, results) => {
            if(err)reject(err);
            else resolve(results);
        });
    });
};
updatePanicButton = (query) => {
    return new Promise((resolve, reject) => {
        panicButtonCollection.updateOne({id_user: parseInt(query.UserID)},{ $set:
            {
                location : {
                    "type": "Point",
                    "coordinates": [parseFloat(query.Longitude),parseFloat(query.Latitude)]
                },
                updated_at : new Date()
            }
        }, function(err, result) {
            if(err){
                reject(err);
            }else {
                resolve(result);
            }
        });
    });
};
insertPanicButton = (query) => {
    return new Promise((resolve, reject) =>{
        let panicQuery = {
            id_user:parseInt(query.UserID),
            nama_user:query.Nama,
            location : {
                "type": "Point",
                "coordinates": [parseFloat(query.Longitude),parseFloat(query.Latitude)]
            },
            created_at:new Date()
        };
        panicButtonCollection.insertOne(panicQuery, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        });
    });
};
insertPanicButtonHistory = (query) => {
    return new Promise((resolve, reject) =>{
        let panicQuery = {
            id_user:parseInt(query.UserID),
            nama_user:query.Nama,
            location : {
                "type": "Point",
                "coordinates": [parseFloat(query.Longitude),parseFloat(query.Latitude)]
            },
            created_at:new Date()
        };
        panicButtonHistoryCollection.insertOne(panicQuery, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        });
    });
};


module.exports = {
    findByIdUser:findByIdUser,
    insertPanicButton:insertPanicButton,
    updatePanicButton:updatePanicButton,
    insertPanicButtonHistory:insertPanicButtonHistory,
    findHistoryByIdUser:findHistoryByIdUser
};