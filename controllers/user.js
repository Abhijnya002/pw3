const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { deleteMany } = require('../models/user');

exports.signup = (req, res) => {
    console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
            err: errorHandler(err)
     });
                    
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
        user
    });
});
};


exports.signin = (req, res) => {

    const { email, password} = req.body;
    User.findOne({email} , (err , user) => {
        if( err || !user){
            return res.status(400).json({
                err: "no user found.Please signup"
         });
    }
    //if user found check email and password match

    if(!user.authenticate(password)){
        return res.status(400).json({
            err: "email and password dont match"
     });
    }

    const token = jwt.sign({_id: user._id}, "" + process.env.JWT_SECRET);
    res.cookie('t', token, {expire: new Date() + 9999});
    const {_id, name, email, role} = user;
    return res.json({token, user:{_id, email, name, role}});
});
};

exports.signout = (req,res) => {
    res.clearCookie('t');
    res.json({message: "Sign out success"});
}