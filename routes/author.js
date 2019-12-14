let authors = require('../models/author');
let express = require('express');
let router = express.Router();
let Author = require('../models/author');

router.searchAuthor = (req,res) =>{
    const pattern = new RegExp('^.*'+req.body.id+'.*$','i');
    Author.find({"id": pattern} , function(err,cellback){
        if (err)
            res.send(err);
        res.json(authors);
    });
}

router.findAllAuthor = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Author.find(function(err, authors) {
        if (err)
            res.send(err);
        res.send(JSON.stringify(authors,null,5));
    });
}


router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Author.find({ "id" : req.params.id },function(err, authors) {
        if (err)
            res.send('Author NOT Found!!');
        else
            res.send(JSON.stringify(authors,null,5));
    });
}



router.addAuthor = (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    var name = req.body.name;
    if(!name){
        res.json({ message: 'Name cannot be empty'} );
    }
    else{
        Author.findOne({name:name},function (err, info) {
            if(info){
                res.json({ message: 'Name is existed',errmsg : err} );
                return;
            }
            var author = new Author({
                name: name
            });

            author.save(function(err) {
                if (err)
                    res.json({ message: 'Author NOT Found!'});
                else
                    res.json({ message: 'Author Added Successfully!'});
            });
        });
    }


}

router.deleteAuthor = (req, res) => {
    Author.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'Author NOT Found!'});
        else
            res.json({ message: 'Author Deleted!'});
    });
}


module.exports = router;