let express = require('express');

let router = express.Router();

let Fairytale = require('../models/fairytale');

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fairytaledatabase');
let db = mongoose.connection;
db.on('error', function (err) {
  console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});
db.once('open', function () {
  console.log('Successfully Connected to [ ' + db.name + ' ]');
});

router.findAllFairytale = (req, res) => {
  // Return a JSON representation of our list
  res.setHeader('Content-Type', 'application/json');
  Fairytale.find(function (err, fairytale) {
    if (err) res.send(err);
    res.send(JSON.stringify(fairytale, null, 5));
  });
};

router.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Fairytale.find({
    "id": req.params.id
  }, function (err, fairytale) {
    if (err) res.send('Fairy tale NOT Found!!');else res.send(JSON.stringify(fairytale, null, 5));
  });
};

function getTotalLike(array) {
  let totalLike = 0;
  array.forEach(function (obj) {
    totalLike = obj.like + totalLike;
  });
  return totalLike;
}

router.addFairytale = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var name = req.body.name;
  var author = req.body.author;

  if (!name) {
    res.json({
      message: 'Fairy tale name or author cannot be empty'
    });
  } else if (!author) {
    res.json({
      message: 'Fairy tale name or author cannot be empty'
    });
  } else {
    Fairytale.findOne({
      name: name
    }, function (err, info) {
      if (info) {
        res.json({
          message: 'The fairytale is already exist',
          errmsg: err
        });
        return;
      }

      var fairytale1 = new Fairytale({
        name: name,
        author: author
      });
      fairytale1.save(function (err) {
        if (err) res.json({
          message: 'Fairytale NOT Added!'
        });else res.json({
          message: 'Fairytale Added Successfully!'
        });
      });
    });
  }
};

router.incrementLikes = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Fairytale.findById(req.params.id, function (err, fairytale1) {
    if (err) res.send('Fairytale NOT Found - LIKE NOT Successful!!');else {
      fairytale1.like += 1;
      fairytale1.save(function (err) {
        if (err) res.send('Fairytale NOT Found - LIKE NOT Successful!!');else res.json({
          status: 200,
          message: 'LIKE Successful',
          fairytale: fairytale1
        });
      });
    }
  });
};

router.deleteFairytale = (req, res) => {
  Fairytale.findByIdAndRemove(req.params.id, function (err) {
    if (err) res.json({
      message: 'Fairy tale NOT FOUND!'
    });else res.json({
      message: 'Fairy tale Deleted!'
    });
  });
};

router.findTotalLike = (req, res) => {
  Fairytale.find(function (err, fairytale) {
    let votes = getTotalLike(fairytale);
    if (err) res.json({
      message: "Fairytale find total Like Failed!!!"
    });else res.setHeader('Content-Type', 'application/json');
    res.json({
      totalLike: votes
    });
  });
};

module.exports = router;