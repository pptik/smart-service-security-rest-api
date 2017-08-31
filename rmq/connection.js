const rmq_config = require('../configs/rmq.json');
let rmq = require('amqplib');
const userService = require('./users');
const broadcaster = require('./broadcaster');

/** connect to rabbit**/
connect = async() => {
    try {
        let connection = await rmq.connect(rmq_config.broker_uri);
        await consume(connection);
        await broadcaster.broadcastSecurity(connection);
    }catch (er){
        console.log(err);
    }
};


/** consume to incoming msg**/
consume = async (connection) => {
    try {
        let channel = await connection.createChannel();
        await channel.assertExchange(rmq_config.exchange_name, 'topic', {durable : true});
        let q = await channel.assertQueue(rmq_config.service_queue_name, {exclusive : true});
        await channel.bindQueue(q.queue, rmq_config.exchange_name, rmq_config.service_route);
        channel.consume(q.queue, (msg) => {
            console.log("=================================================");
            console.log("Incoming msg : "+msg.content.toString());
            /** update Security location**/
            if(msg.fields.routingKey === rmq_config.route_update_security){
                let query = JSON.parse(msg.content.toString());
                console.log("-------------------------------------------------");
                console.log('UPDATE LOKASI USER');
                console.log("-------------------------------------------------");
                userService.updateUserLocation(query).then(result =>{
                    console.log("process success : "+JSON.stringify(result));
                }).catch(err =>{
                   console("process failed : "+JSON.stringify(err));
                });
            }
        }, {noAck: true});
        console.log("Service consume on : "+rmq_config.service_route);
    }catch(err) {
        console.log(err);
    }
};


module.exports = {
    connect:connect
};