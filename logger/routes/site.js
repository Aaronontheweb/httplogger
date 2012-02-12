
/*
 * GET home page.
 */
 
var Log = require('../models/log');

var logs = new Log();
//logs.init(function(){}); //Initialize if we haven't already

module.exports = function(app){
    /*
    * GET / {root}
    */
    app.get('/', function(req, res){
    //Grab the 30 most recent logs
     logs.list(30, function(error, data){
        if(error) return res.render('index', { title: 'Recent Logs', errors:error });
        res.render('index', { title: 'Recent Logs', logs:data });
     });         
    });

    /*
     * POST /{root}/log
     */
    app.post('/log', function(req, res){
        if(!req.body.logMessage) return res.json(
            {error:"Did not pass acceptable HTTP POST arguments. Need to be in the form of logMessage[PROPERTY]."}, 400);
        logs.save(req.body.logMessage, function(error, data){
            if(error) return res.json(
            {error:"Unable to save log message", source:req.body.logMessage}, 500);
            res.json({message:"ok"}, 200);
        })
    });
};