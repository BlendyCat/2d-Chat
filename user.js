var mongo = require('mongodb');
var client = mongo.MongoClient;

var url = 'mongodb://localhost:27017/';

exports.findOne = (query, callback)=>{
    client.connect(url, function(err, db){
        if(err) {
            return callback(err, false);
        }
        var dbo = db.db('2dchat');
        dbo.collection('users').findOne(query, (err, res)=>{
            return callback(err, res);
        });
        db.close();
    });
};

exports.findById = (id, callback)=>{
    client.connect(url, function(err, db){
        if(err) {
            return callback(err, false);
        }
        var dbo = db.db('2dchat');
        dbo.collection('users').findOne({_id:id}, callback);
        db.close();
    });
};

exports.insertOne = (user, callback)=>{
    client.connect(url, function(err, db){
        if(err){
            return callback(err, false);
        }
        var dbo = db.db('2dchat');
        dbo.collection('users').insertOne(user, function(err, res){

        });
    });
};


exports.User = function(username, password){
    this.username = username;
    this.password = password;
    /** obviously this is a really shit way of validating password
     * In a more realistic environment you'd be checking a hash or a salted hash
     * @param password the password to be checked
     */
    this.validPassword = function(password){
        console.log(this.password === password);
        return this.password === password;
    }
};