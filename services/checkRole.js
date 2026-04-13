require('dotenv').config();

checkRole=(req,res,next)=>{
if(res.locals.role==ProcessingInstruction.env.USER){
    res.status(401)
}else{
 next()   
}
}

module.exports = {checkRole:checkRole}