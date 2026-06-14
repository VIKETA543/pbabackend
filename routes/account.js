const express = require("express");
const connection = require('../connection');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const router = express.Router();
const pool = require('../connection');
var auth = require('../services/authentication')
const checkRole = require("../services/checkRole");

   
router.get('/loadformprices', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log('on target')
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)  

            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT price_number, price_value, academic_grade,academic_year,date_posted,price_status FROM form_prices"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error)
                req.readable()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.length > 0) {
                    connection.release()
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].price_status === 1) {
                            results[i].price_status = true
                        } else {
                            if (results[i].price_status === 0) {
                                results[i].price_status = false
                            }
                        }
                    }
                    return res.status(200).json({ data: results })
                } else {
                    connection.release()
                    return res.status(201).json({ message: 'No records at the moment' })
                }
            }
        })

    })
})

router.post('/submitprices', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT price_number, price_value, academic_grade,academic_year,date_posted,price_status FROM form_prices WHERE price_status=? AND academic_grade=? AND academic_year=?"
        connection.query(query, [true, data.academic_grade, data.academic_year], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.length > 0) {

                    if (results[0].price_number === data.price_number) {
                        return res.status(201).json({ message: 'Form Price for this academicy has already been created' })
                    } else {
                        connection.query('BEGIN')
                        query = 'UPDATE form_prices SET  price_status=? WHERE price_status=? AND academic_grade=? AND academic_year=?"'
                        connection.query(query, [false, true, data.academic_grade, data.academic_year], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                            } else {
                                if (results.affectedRows > 0) {
                                    query = "INSERT INTO form_prices (price_number, price_value, academic_grade,academic_year,date_posted,price_status) VALUES(?,?,?,?,?,?)"
                                    connection.query(query, [data.price_number, data.price_value, data.academic_grade, data.academic_year, data.date_posted, data.price_status], (error, result) => {
                                        if (error) {
                                            console.log(error)
                                            res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                                        } else {
                                            if (result.affectedRows > 0) {
                                                connection.query('COMMIT')
                                                connection.release()
                                                return res.status(200).json({ success: 'Request was successful' })
                                            } else {
                                                connection.query('ROLLBACK')
                                                connection.release()
                                                return res.status(2001).json({ message: 'Something went wrong., Request failed' })
                                            }
                                        }
                                    })

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO form_prices (price_number, price_value, academic_grade,academic_year,date_posted,price_status) VALUES(?,?,?,?,?,?)"
                    connection.query(query, [data.price_number, data.price_value, data.academic_grade, data.academic_year, data.date_posted, data.price_status], (error, result) => {
                        if (error) {
                            console.log(error)
                            res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                        } else {
                            if (result.affectedRows > 0) {
                                connection.release()
                                return res.status(200).json({ success: 'Request was successful' })
                            } else {
                                connection.release()
                                return res.status(2001).json({ message: 'Something went wrong., Request failed' })
                            }
                        }
                    })
                }
            }
        })

    })
})


// dropFormPrice


router.post('/dropFormPrice', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT * FROM form_prices WHERE price_number=?"
        connection.query(query, [data.price_number], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.length > 0) {
                    connection.release()
                    query = 'DELETE FROM form_prices WHERE price_number=?'
                    connection.query(query, [data.price_number], (error, results) => {
                        if (error) {
                            console.log(error)
                            res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                        } else {
                            if (results.affectedRows > 0) {
                                connection.release()
                                return res.status(200).json({ success: 'Price successfuly deleted' })
                            } else {
                                connection.release()
                                return res.status(201).json({ message: 'Delete action failed' })
                            }
                        }
                    })
                } else {
                    connection.release()
                    return res.status(201).json({ message: 'No records at the moment' })
                }
            }
        })

    })
})






router.post('/getForm', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)

            console.error('Error getting connection from pool:', err);
            return;
        }
        console.log(data)
        query = "SELECT form_prices.price_number, form_prices.price_value, form_prices.academic_grade, form_prices.academic_year, form_prices.date_posted, form_prices.price_status," +
            "SerialNumber,SerialPin  FROM form_prices LEFT JOIN applicationserial ON form_prices.academic_year=applicationserial.academic_year  WHERE form_prices.academic_grade=? AND form_prices.price_status=? AND applicationserial.academic_year=? AND applicationserial.SerialStatus=? AND applicationserial.Authority=? LIMIT 1 "
        connection.query(query, [data.grade, true, data.acdemicyear, '', ''], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.length > 0) {
                    connection.release()

                    return res.status(200).json({ data: results })
                } else {

                    connection.release()
                    return res.status(201).json({ message: 'No records at the moment' })
                }
            }
        })

    })
})




router.post('/payform', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)

            console.error('Error getting connection from pool:', err);
            return;
        }
        console.log(data)
        query = "UPDATE applicationserial SET SerialStatus=?,Authority=?, SoldDate=? WHERE SerialNumber=? AND SerialPin=?"
        connection.query(query, ['SOLD', 'Authorised', new Date(), data.serial, data.pin], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.affectedRows > 0) {
                    query = 'INSERT INTO salesofapplicationserial (SerialNumber,SerialPin,Price,soldBy,SerialStatus,academic_year)VALUES(?,?,?,?,?,?)'
                    connection.query(query, [data.serial, data.pin,data.price,data.user,'SOLD',data.academic_year], (error, results) => {
                        if (error) {
                            console.log(error)
                            connection.release()
                            res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                        } else {
                            if (results.affectedRows > 0) {
                                connection.release()
                                console.log('Payment compplete')
                                return res.status(200).json({ success: 'Payment successfuly completed' })
                            } else {
                                connection.release()
                                res.status(201).json({ message: "Payment could not be completed" })
                            }
                        }
                    })

                } else {
                    connection.release()
                    console.log('Payment failed')
                    return res.status(201).json({ message: 'Payment failed' })
                }
            }
        })

    })
})



router.get('/soldforms', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log('on target')
    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)

            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT applicationserial.SerialNumber, applicationserial.SerialPin, applicationserial.SerialStatus, applicationserial.SoldDate, applicationserial.Authority, applicationserial.dateGenerated, applicationserial.academic_year,academicsession.ac_session,form_prices.price_value " +
            "FROM applicationserial LEFT JOIN academicsession ON applicationserial.academic_year=academicsession.sessionID LEFT JOIN form_prices ON applicationserial.academic_year=form_prices.academic_year " +
            " WHERE applicationserial.Authority=? AND  applicationserial.SerialStatus=?"
        connection.query(query, ['Authorised', 'SOLD'], (error, results) => {
            if (error) {
                console.log(error)
                req.readable()
                res.status(201).json({ message: "The Server encountered an internal error the prevented your request to be served" })
            } else {
                if (results.length > 0) {
                    connection.release()
                    return res.status(200).json({ data: results })
                } else {
                    connection.release()
                    return res.status(201).json({ message: 'No records at the moment' })
                }
            }
        })

    })
})

module.exports = router