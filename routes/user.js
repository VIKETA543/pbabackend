const express = require("express");
const pool = require('../connection');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require("cors");
require('dotenv').config();
const router = express.Router();
var auth = require('../services/authentication')
const checkRole = require("../services/checkRole");

router.post('/signup', (req, res) => {
    let user = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "select userName,contactNumber,email,Password,STATUS,role from user where email=?"
        connection.query(query, [user.email], (err, results) => {
            if (!err) {

                if (results.length <= 0) {
                    query = "insert into user(userName,contactNumber,email,Password,StaffID,STATUS,role)values(?,?,?,?,?,'false','user')"
                    connection.query(query, [user.name, user.contactNumber, user.email, user.password, user.StaffID], (err, results) => {
                        if (!err) {
                            connection.release()
                            return res.status(200).json({ message: 'User successfully added!' })
                        } else {
                            return res.status(500).json(err)
                        }
                    })
                } else {
                    return res.status(400).json({ message: "Email already exist!" })
                }
            } else {
                return res.status(500).json(err);
            }
        })

    })

})

router.post('/login', cors({ origin: '*' }), async (req, res) => {
    const user = req.body;

        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

   pool.getConnection((err,   connection) => {
    console.log("getting connection")
    if (err) {
        console.log(err)
        console.error('Error getting connection from pool:', err);
        return;
    }

query = "select FullName,contactNumber,email,Password,StaffID,STATUS,role,Photo FROM user where email=?";
  
        connection.query(query, [user.email], (err, results) => {
            if (!err) {
                      console.log(query)
                if (results.length <= 0 || results[0].Password != user.password) {
                    return res.status(401).json({ message: "Incorrect Username or Password" });
                } else {
                    console.log( results[0].STATUS)
                    if (results[0].STATUS === 'false') {

                        return res.status(401).json({ message: "Wait for Admin Approval!" });
                    } else {
                        if (results[0].Password == user.password) {

                            const response = { email: results[0].email, userName: results[0].userName, userID: results[0].StaffID, PhoneNumber: results[0].contactNumber, role: results[0].role };
                            const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                            if (results[0].Photo) {
                                var buffer = Buffer(results[0].Photo);
                                var BufferedBase64 = buffer.toString('base64');
                                       connection.release();
                                return res.status(200).json({ token: accessToken, userData: response, Photo: BufferedBase64 });
                            } else {
                                return res.status(200).json({ token: accessToken, userData: response });
                            }


                        } else {
                            console.log("error some went wrong");
                                   connection.release();
                            return res.status(400).json({ message: 'Something went wrong. Please try again later.' });
                        }
                    }
                }
            } else {
                    
                console.log(err)
       connection.release();
                return res.status(500).json(err);
            }
        });
       
});

})
//setting API for password recovery
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }

})

router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

        query = 'SELECT email,Password from user where email=?';
        connection.query(query, [user.email], (err, results) => {
            if (!err) {
                if (results.length <= 0) {
                    return res.status(200).json({ message: 'Password sent successfully to your email' })
                } else {
                    //   console.log(process.env.EMAIL)
                    //   console.log(process.env.PASSWORD)
                    var mailoptions = {
                        from: process.env.EMAIL,
                        to: results[0].email,
                        subject: 'Password by BHA',
                        html: '<p><b>Your Login details for BHA account is<br><b>Email:</b>' + results[0].email + '</b><br><b>Password:</b>' + results[0].Password + '<br><a href="http://localhost:4200/">click here to login</a></p>'
                    };
                    transporter.sendMail(mailoptions, function (error, info) {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('Email sent ' + info.response)
                        }
                    });
                    return res.status(200).json({ message: 'Password sent successfully to your email' })

                }
            } else {
                return res.status(500).json(err)
            }
        })
    })
})
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

        var query = "select id,userName,contactNumber,email,Password,STATUS,role from user where role='user'"
        connection.query(query, (err, results) => {
            if (!err) {
                return res.status(200).json(results);
            } else {
                return res.status(500).json(err);
            }
        })
    })
})
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

        var query = "Update user set status=? where id=?";

        connection.query(query, [user.status, uswr.id], (err, results) => {
            if (!err) {
                if (results.affectedRow == 0) {
                    return res.status(404).json({ message: 'user id does not exist' })
                }
                return res.status(200).json({ message: 'User updated successfully' })

                //
            } else {
                return res.status(500).json(err);
            }
        })
    })
})
router.get('/checkToken', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    return res.status(200).json({ message: 'true' })

})
router.post('/changePassword', (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

        var query = "select * from user where email=?"
        connection.query(query, [email, user.oldPassword], (err, results) => {
            if (!err) {
                if (results.length <= 0) {
                    return res.status(400).json({ message: 'Incorrect old Password' })
                } else {
                    if (results[0].password == user.oldPassword) {
                        query = "update user set Password=? where email=?";
                        connection.query(query, [user.newPassword, email], (err, results) => {
                            if (!err) {
                                return res.status(200).json({ message: 'Password update successfully' })
                            } else {
                                return res.status(500).json(err)
                            }
                        })
                    } else {
                        return res.status(400).json({ message: 'Something went wrong please try again later' })
                    }
                }
            } else {
                return res.status(500).json(err)
            }
        })
    })
})
router.post('/ApplicantBioData', (req, res) => {
    console.log(req.body)
})

module.exports = router;