const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongodb
//creates database
mongo.connect('mongodb://127.0.0.1/mongochat',function(err,db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');
});
// connect to socket.io
client.on('connection',function(socket){
    let chat = db.collection('chats');

    //create function to send the status to the server

    sendStatus = function(){
        socket.emit('status',s);
    }



    //get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
        if(err){
            throw err;
        }


        //emit messages
        socket.emit('output',res);
        
        });


        //handle input events
        socket.on('input',function(data){
            let name = data.name;
            let message = data.message;

            //check for name and message
            if(name == '' || message == ''){
                //send error status
                sendStatus('Please enter the name and message');
            } else {
                //insert message
                chat.insert({name: name,message:message}, function(){
                    client.emit('output',[data]);

                    //send status
                    sendStatus({
                        message:'message sent',
                        clear:true
                    });
                });
            }
        });
        //handle clear
        socket.on('clear',function(data){
            //remove all chats
            chat.remove({},function(){
                //emit clear
                socket.emit('cleared');
            })
        });
    });
