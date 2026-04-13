require('dotenv').config();
const http=require('http');
const app=require('./index');

const server=http.createServer(app);
server.maxHeaderSize = 16 * 4096;
server.listen(process.env.PORT||4000,(req,res)=>{
   
console.log("Server connected and listening on "+process.env.PORT)
// logger.info("Server connected and listening on "+process.env.PORT)

})