let express = require('express');

let router = express.Router();

let Admin = require('../models/admin');

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fairytaledatabase');
let db = mongoose.connection;
db.on('error', function (err) {
  console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});
db.once('open', function () {
  console.log('Successfully Connected to [ ' + db.name + ' ]');
});

router.findAllAdmin = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Admin.find(function (err, admins) {
    if (err) res.send(err);
    res.send(JSON.stringify(admins, null, 5));
  });
};

router.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Admin.find({
    "_id": req.params.id
  }, function (err, admin) {
    if (err) res.send('Admin NOT Found!!');else res.send(JSON.stringify(admin, null, 5));
  });
};

router.register = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var name = req.body.name;
  var pwd = req.body.pwd;

  if (!name) {
    res.json({
      message: 'Name or password cannot be empty'
    });
  } else if (!pwd) {
    res.json({
      message: 'Name or password cannot be empty'
    });
  } else {
    Admin.findOne({
      name: name
    }, function (err, info) {
      if (info) {
        res.json({
          message: 'Name is existed',
          errmsg: err
        });
        return;
      }

      var admin = new Admin({
        name: name,
        pwd: pwd
      });
      admin.save(function (err) {
        if (err) res.json({
          message: 'Registered Failed. Please try again.',
          errmsg: err
        });else res.json({
          message: 'Registered Successfully!!',
          data: admin
        });
      });
    });
  }
};

router.login = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var name = req.body.name;
  var pwd = req.body.pwd;

  if (!name) {
    res.json({
      message: 'Name or password cannot be empty'
    });
  } else if (!pwd) {
    res.json({
      message: 'Name or password cannot be empty'
    });
  } else {
    Admin.findOne({
      name: name
    }, function (err, admin) {
      if (admin) {
        if (admin.pwd === pwd) {
          res.json({
            message: 'Login successfully'
          });
        } else {
          res.json({
            message: 'Password is wrong!!'
          });
        }
      } else {
        res.json({
          message: 'Name is not exist'
        });
      }
    });
  }
};

module.exports = router;