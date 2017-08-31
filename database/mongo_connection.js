const config = require('../configs/database.json');
const client = require('mongodb').MongoClient();

/** function to connect to mongodb **/
function connect() {
    return new Promise((resolve, reject) => {
        client.connect(config.mongodb_uri, (err, database) => {
        if(err) {console.log("Connected to mongodb server failed"); reject(err);}
        else {console.log("Connected to mongodb server"); resolve(database);}
        });
    });
}

module.exports = {
    connect:connect
};