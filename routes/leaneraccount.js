const express = require("express");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const router = express.Router();
const pool = require('../connection');
var auth = require('../services/authentication')
const checkRole = require("../services/checkRole");




router.post('/findlearner', (req, res) => {
    console.log(req.body)
    let data = req.body
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT prospectivelearners.AdmissionNumber,prospectivelearners.IndexNumber,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,passportphotos.Image,academicgrades.SerialNumber,academicgrades.GradeDescription FROM prospectivelearners LEFT JOIN applicantbiodata ON  prospectivelearners.AdmissionNumber=applicantbiodata.AdmissionNumber LEFT JOIN passportphotos ON prospectivelearners.AdmissionNumber=passportphotos.AdmissionNumber LEFT JOIN academicgrades ON  prospectivelearners.AssignedClass=academicgrades.SerialNumber WHERE prospectivelearners.IndexNumber=? OR prospectivelearners.AdmissionNumber=?"
        connection.query(query, [data.learnerID, data.learnerID], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    var buffer = Buffer(results[0].Image);
                    var BufferedBase64 = buffer.toString('base64')
                    results[0].Image = BufferedBase64
                    connection.release()
                    // console.log(results)
                    return res.status(200).json({ data: results })
                } else {
                    connection.release()
                    return res.status(201).json({ message: 'Not found' })
                }
            }
        })
    })

})

// academicdata


router.get('/academicdata', (req, res) => {
    console.log("The body of query")

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT academicweekslist.WeekDescription,academicterms.TermlyObject,academicsession.ac_session,academicsession.sessionID, termbegins.OpenedTerm FROM academicweekslist LEFT JOIN termbegins ON termbegins.WeekOpened=academicweekslist.WeekID LEFT JOIN academicterms ON termbegins.OpenedTerm=academicterms.Tid LEFT JOIN academicsession ON termbegins.AcademicYear=academicsession.sessionID  WHERE termbegins.isCurrent=? "
        connection.query(query, [true], (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    connection.release()
                    console.log(results)
                    return res.status(200).json({ data: results })
                } else {
                    console.log('Not found')
                    connection.release()
                    return res.status(201).json({ message: 'No Active academic term opened' })
                }
            }
        })
    })
})

//loading academic details for billing


router.get('/department', (req, res) => {
    console.log("The body of query")

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT DeptId,DeptName FROM academicdepartment"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    connection.release()
                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: 'No department' })
                }
            }
        })
    })
})

// loading grades
router.get('/grades', (req, res) => {
    console.log("The body of query")

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        console.log("getting connection")
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT SerialNumber,GradeDescription FROM academicgrades"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    connection.release()
                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: 'No Grades' })
                }
            }
        })
    })
})



// loading Academic Term
router.get('/academicTerm', (req, res) => {
    console.log("The body of query")

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT Tid,TermlyObject FROM academicterms"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    connection.release()
                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: 'No Grades' })
                }
            }
        })
    })
})
// loading academic years for billing


router.get('/academicYear', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        }
        query = "SELECT sessionID,ac_session FROM academicsession"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error)
                connection.release()
                return res.status(201).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    connection.release()
                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: 'No Grades' })
                }
            }
        })
    })
})




// Loading school fee bills hisotry

router.get('/loadbillhistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT schoolfeebills.sn,schoolfeebills.billNumber,schoolfeebills.sessionID,academicsession.ac_session,schoolfeebills.Tid,academicterms.TermlyObject, schoolfeebills.currentBill,schoolfeebills.dateposted,schoolfeebills.isCurrentbill,schoolfeebills.Department,academicdepartment.DeptName,schoolfeebills.GradeID, academicgrades.GradeDescription FROM schoolfeebills LEFT JOIN academicsession ON  schoolfeebills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  schoolfeebills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON schoolfeebills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  schoolfeebills.GradeID=academicgrades.SerialNumber'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadPaymentHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT school_fee_payments.billNumber,school_fee_payments.parenBillNumber,school_fee_payments.PaymentNumber,school_fee_payments.AdmissionNumber,school_fee_payments.sessionID,school_fee_payments.Tid,school_fee_payments.Academicgrade,school_fee_payments.amountpaid,school_fee_payments.currentBalance,school_fee_payments.isCurrentbillStatus ,school_fee_payments.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM school_fee_payments LEFT JOIN academicsession ON school_fee_payments.sessionID=academicsession.sessionID LEFT JOIN academicterms ON school_fee_payments.Tid=academicterms.Tid LEFT JOIN academicgrades ON school_fee_payments.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE school_fee_payments.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbillStatus === 1) {
                                results[i].isCurrentbillStatus = true
                            } else {
                                results[i].isCurrentbillStatus = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadFeebalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT currentBalance AS currentBalance FROM school_fee_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbillStatus=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM school_fee_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbillStatus=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT totalBill,billNumber,parenBillNumber FROM school_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT totalBill,billNumber,parenBillNumber FROM school_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postPayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  school_fee_payments WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbillStatus=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE school_fee_payments SET isCurrentbillStatus=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbillStatus=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO school_fee_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbillStatus)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO school_fee_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbillStatus)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})

// setting canteen payment queries


router.post('/loadCanteenHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT canteen_fee_payment.billNumber,canteen_fee_payment.parenBillNumber,canteen_fee_payment.PaymentNumber,canteen_fee_payment.AdmissionNumber,canteen_fee_payment.sessionID,canteen_fee_payment.Tid,canteen_fee_payment.Academicgrade,canteen_fee_payment.amountpaid,canteen_fee_payment.TermlyBalance,canteen_fee_payment.isCurrentbill ,canteen_fee_payment.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM canteen_fee_payment LEFT JOIN academicsession ON canteen_fee_payment.sessionID=academicsession.sessionID LEFT JOIN academicterms ON canteen_fee_payment.Tid=academicterms.Tid LEFT JOIN academicgrades ON canteen_fee_payment.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE canteen_fee_payment.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbill === 1) {
                                results[i].isCurrentbill = true
                            } else {
                                results[i].isCurrentbill = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadCanteenbalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT TermlyBalance AS currentBalance FROM canteen_fee_payment  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM canteen_fee_payment  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT TotalCanteenFee AS totalBill,billNumber,parenBillNumber FROM canteen_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT TotalCanteenFee AS totalBill,billNumber,parenBillNumber FROM canteen_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postCanteenPayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  canteen_fee_payment WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE canteen_fee_payment SET isCurrentbill=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO canteen_fee_payment(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,TermlyBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO canteen_fee_payment(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,TermlyBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})




// SETTING SPECIAL LEVY QUERIES/
// ============================




router.post('/loadsepciallevyHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT special_levy_payments.billNumber,special_levy_payments.parenBillNumber,special_levy_payments.PaymentNumber,special_levy_payments.AdmissionNumber,special_levy_payments.sessionID,special_levy_payments.Tid,special_levy_payments.Academicgrade,special_levy_payments.amountpaid,special_levy_payments.currentBalance,special_levy_payments.isCurrentbill ,special_levy_payments.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM special_levy_payments LEFT JOIN academicsession ON special_levy_payments.sessionID=academicsession.sessionID LEFT JOIN academicterms ON special_levy_payments.Tid=academicterms.Tid LEFT JOIN academicgrades ON special_levy_payments.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE special_levy_payments.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbill === 1) {
                                results[i].isCurrentbill = true
                            } else {
                                results[i].isCurrentbill = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadspeciallevybalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT currentBalance AS currentBalance FROM special_levy_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM special_levy_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM special_levy_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM special_levy_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postspeciallevyPayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  special_levy_payments WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE special_levy_payments SET isCurrentbill=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO special_levy_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO special_levy_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})



// 
// 
// 
// SETTING BUSS FEE QUERIES



router.post('/loadBusHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT bus_fee_payment.billNumber,bus_fee_payment.parenBillNumber,bus_fee_payment.PaymentNumber,bus_fee_payment.AdmissionNumber,bus_fee_payment.sessionID,bus_fee_payment.Tid,bus_fee_payment.Academicgrade,bus_fee_payment.amountpaid,bus_fee_payment.currentBalance,bus_fee_payment.isCurrentbill ,bus_fee_payment.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM bus_fee_payment LEFT JOIN academicsession ON bus_fee_payment.sessionID=academicsession.sessionID LEFT JOIN academicterms ON bus_fee_payment.Tid=academicterms.Tid LEFT JOIN academicgrades ON bus_fee_payment.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE bus_fee_payment.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbill === 1) {
                                results[i].isCurrentbill = true
                            } else {
                                results[i].isCurrentbill = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadBusbalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT currentBalance AS currentBalance FROM bus_fee_payment  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM bus_fee_payment  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT TotalCanteenFee AS totalBill,billNumber,parenBillNumber FROM bus_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT TotalCanteenFee AS totalBill,billNumber,parenBillNumber FROM bus_fee_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postBusPayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  bus_fee_payment WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE bus_fee_payment SET isCurrentbill=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO bus_fee_payment(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO bus_fee_payment(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})






// 
// 
// 
// SETTING PTA DUES QUERIES



router.post('/loadptadueHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT pta_due_payments.billNumber,pta_due_payments.parenBillNumber,pta_due_payments.PaymentNumber,pta_due_payments.AdmissionNumber,pta_due_payments.sessionID,pta_due_payments.Tid,pta_due_payments.Academicgrade,pta_due_payments.amountpaid,pta_due_payments.currentBalance,pta_due_payments.isCurrentbill ,pta_due_payments.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM pta_due_payments LEFT JOIN academicsession ON pta_due_payments.sessionID=academicsession.sessionID LEFT JOIN academicterms ON pta_due_payments.Tid=academicterms.Tid LEFT JOIN academicgrades ON pta_due_payments.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE pta_due_payments.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbill === 1) {
                                results[i].isCurrentbill = true
                            } else {
                                results[i].isCurrentbill = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadptaduebalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT currentBalance AS currentBalance FROM pta_due_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM pta_due_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM pta_due_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM pta_due_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postptaduePayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  pta_due_payments WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE pta_due_payments SET isCurrentbill=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO pta_due_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO pta_due_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})




// 
// 
// 
// SETTING PTA UNIFORMS QUERIES



router.post('/loadUniformHistory', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT uniform_bill_payments.billNumber,uniform_bill_payments.parenBillNumber,uniform_bill_payments.PaymentNumber,uniform_bill_payments.AdmissionNumber,uniform_bill_payments.sessionID,uniform_bill_payments.Tid,uniform_bill_payments.Academicgrade,uniform_bill_payments.amountpaid,uniform_bill_payments.currentBalance,uniform_bill_payments.isCurrentbill ,uniform_bill_payments.dateposted, academicsession.ac_session,academicterms.TermlyObject,academicgrades.GradeDescription ' +
                ' FROM uniform_bill_payments LEFT JOIN academicsession ON uniform_bill_payments.sessionID=academicsession.sessionID LEFT JOIN academicterms ON uniform_bill_payments.Tid=academicterms.Tid LEFT JOIN academicgrades ON uniform_bill_payments.Academicgrade=academicgrades.SerialNumber ' +
                ' WHERE uniform_bill_payments.AdmissionNumber=?'
            connection.query(query, [data.adminssionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].isCurrentbill === 1) {
                                results[i].isCurrentbill = true
                            } else {
                                results[i].isCurrentbill = false
                            }
                        }
                        return res.status(200).json({ data: results })
                    } else {

                        return res.status(200).json({ noreults: 'No records available' })
                    }
                }
            })


        }


    })
})



router.post('/loadUniformbalance', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {

            query = "SELECT currentBalance AS currentBalance FROM uniform_bill_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
            connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        let currentBalance = results[0].currentBalance
                        query = "SELECT SUM(amountpaid) AS sumPaid FROM uniform_bill_payments  WHERE sessionID=? AND Tid=? AND AdmissionNumber=? AND isCurrentbill=?"
                        connection.query(query, [data.sessionID, data.Tid, data.adminssionNumber, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    let sumPaid = results[0].sumPaid


                                    query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM uniform_bill_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: sumPaid, balance:currentBalance , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })




                                } else {


                                }
                            }
                        })
                    } else {
                        query = 'SELECT totalBill AS totalBill,billNumber,parenBillNumber FROM uniform_bill_schedule  WHERE AdmissionNumber=? AND isCurrentbill=?'
                                    connection.query(query, [data.adminssionNumber, true], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.length > 0) {
                                                let totalBill = results[0].totalBill
                                                let billNumber = results[0].billNumber
                                                let parenBillNumber = results[0].parenBillNumber
                                                  return res.status(200).json({ totalBill: totalBill, sumpaid: 0, balance:totalBill , billNumber: billNumber, parenBillNumber: parenBillNumber })
                                            } else {
                                                console.log(error)
                                                return res.status(201).json({ message: 'This learner has no bill information this term' })

                                            }
                                        }
                                    })
                    }
                }
            })

        }


    })
})

// 


router.post('/postUniformPayment', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT * FROM  uniform_bill_payments WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=? '
            connection.query(query, [data.billNumber, data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        query = 'UPDATE uniform_bill_payments SET isCurrentbill=? WHERE billNumber=? AND AdmissionNumber=? AND isCurrentbill=?'
                        connection.query(query, [false, data.billNumber, data.AdmissionNumber,  data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {

                                    query = ' INSERT INTO uniform_bill_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            connection.release()
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                connection.release()
                                                return res.status(200).json({ success: 'Payment Complete' })
                                            } else {
                                                connection.release()
                                                return res.status(200).json({ message: 'No records available' })
                                            }
                                        }
                                    })

                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'Payment failed' })
                                }
                            }
                        })

                    } else {
                        query = ' INSERT INTO uniform_bill_payments(billNumber,PaymentNumber,parenBillNumber,AdmissionNumber,sessionID,Tid,Academicgrade,amountpaid,currentBalance,dateposted,isCurrentbill)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                        connection.query(query, [data.billNumber, data.PaymentNumber, data.parenBillNumber, data.AdmissionNumber, data.sessionID, data.Tid, data.grade, data.amountToPay, data.balance, data.date, data.isCurrent], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    connection.release()
                                    return res.status(200).json({ success: 'Payment Complete' })
                                } else {
                                    connection.release()
                                    return res.status(200).json({ message: 'No records available' })
                                }
                            }
                        })

                    }
                }

            })


        }


    })
})
module.exports = router