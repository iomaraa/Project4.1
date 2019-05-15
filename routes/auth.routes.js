/*
  @instructor Name:  Ebere.
  @program : WDI 4 Riyadh
*/

const User = require('../models/User');
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWTSecret = process.env.JWTSecret;



const passportHelper = require('../config/passport')


router.get('/', (request, response, next) => {
  //custom jwt authenticate
  passport.authenticate('jwt', {session: false}, (err, user, info)=>{
      console.log("got here")
      if(err){ return response.status(400).json({ message: err }) }

      if(info !== undefined){
        return response.json({ message: info.message })
      }else{
        User.find({})
        .populate('programs')
        .then((user)=>{
          response.json({ user: user });
        })

      }

      
  })(request, response, next)

  
})

router.post('/register', (request, response)=>{

  let data = {
    username : request.body.username ,
    email : request.body.email,
    password: request.body.password 
  }

  let user = new User(data)
  user.save()
  .then((u)=> {
    // response.send('cool')
  //   const token = jwt.sign(user.toJSON(), JWTSecret, { expiresIn: 60 * 60 });
  //   console.log(token);
    
    return response.status(200).json({u});
  })
  .catch(err =>{
    response.status(401).json({ message : "You are not Allowed to Register", err: err})
  })

})


router.post('/login', (request, response) => {

  passport.authenticate('local', {session: false}, (err, user, info) => {

    if (err || !user) {
        return response.status(401).json({
            message: info ? info.message : 'Login failed',
            user   : user
        });
    }

   request.login(user, {session: false}, (err) => {
          if (err) {
              return response.status(401).json({message: err});
          }
          // generate a signed json web token with the contents of user object and return it in the response
          user.password = '' //remove password
          user.populate('programs')
          console.log(user)
          const token = jwt.sign(user.toJSON(), JWTSecret, { expiresIn: 60 * 60 });
          return response.status(200).json({user, token});
        });
    })(request, response);
   
})


module.exports = router