let express = require('express');
let router = express.Router();
let User = require('../models/user');

router.findAllUser = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    User.find(function(err, users) {
        if (err)
            res.send(err);
        res.send(JSON.stringify(users,null,5));
    });
}

router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    User.find({ "id" : req.params.id },function(err, user) {
        if (err)
            res.send('User NOT Found!!');
        else
            res.send(JSON.stringify(user,null,5));
    });
}

router.register = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var name = req.body.name;
    var pwd = req.body.pwd;

    if(!name){
        res.json({ message: 'Name or password cannot be empty'} );
    }
    else if(!pwd){
        res.json({ message: 'Name or password cannot be empty'} );
    }
    else{
        User.findOne({name:name},function (err, info) {
            if(info){
                res.json({ message: 'Username is existed',errmsg : err} );
                return;
            }
            var user = new User({
                name: name,
                pwd: pwd
            });
            user.save(function(err) {
                if (err)
                    res.json({ message: 'Registered Failed. Please try again.', errmsg : err } );
                else
                    res.json({ message: 'Registered Successfully!!', data: user });
            });
        });
    }
}

router.login = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var name = req.body.name;
    var pwd = req.body.pwd;

    if(!name){
        res.json({ message: 'Username or password cannot be empty'} );
    }
    else if(!pwd){
        res.json({ message: 'Username or password cannot be empty'} );
    }
    else{
        User.findOne({name:name},function (err, user) {
            if (user) {
                if (user.pwd === pwd) {
                    res.json({message: 'Login successfully'});
                } else {
                    res.json({message: 'Password is wrong!!'})
                }
            }
            else{
                res.json({message: 'Username is not exist!!'});
            }
        })
    }
}

module.exports = router;