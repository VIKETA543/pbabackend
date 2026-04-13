require('dotenv').config();

const jwt=require('jsonwebtoken');

authenticateToken=(req,res,next)=>{
   console.log(req.body)
 const authHeader=req.headers['authorisation']
 const token=authHeader&& authHeader.split(' ')[1]
 if(token==null){
    return res.sendStatus(401);
 }
 jwt.verify(token,Process.env.ACCESS_TOKEN,(err,response)=>{
    if(err){
        return res.sendStatus(403);

    }
    res.locals=response;
    next();
 })
}


module.exports={authenticateToken:authenticateToken}