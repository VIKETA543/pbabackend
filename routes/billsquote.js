
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
                          if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.get('/CurrentBills', (req, res) => {


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
            query = 'SELECT schoolfeebills.sn,schoolfeebills.billNumber,schoolfeebills.sessionID,academicsession.ac_session,schoolfeebills.Tid,academicterms.TermlyObject, schoolfeebills.currentBill,schoolfeebills.dateposted,schoolfeebills.isCurrentbill,schoolfeebills.Department,academicdepartment.DeptName,schoolfeebills.GradeID, academicgrades.GradeDescription FROM schoolfeebills LEFT JOIN academicsession ON  schoolfeebills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  schoolfeebills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON schoolfeebills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  schoolfeebills.GradeID=academicgrades.SerialNumber WHERE schoolfeebills.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})







router.post('/savebillsquote', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM schoolfeebills WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {
                        console.log(results)
                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE schoolfeebills SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO schoolfeebills (billNumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID)VALUES(?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})



router.post('/dropBill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  schoolfeebills WHERE billNumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})


// Canteen bill code






router.get('/loadcanteenbillhistory', (req, res) => {


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
            query = 'SELECT canteenbills.sn,canteenbills.cbillNumber,canteenbills.sessionID,academicsession.ac_session,canteenbills.Tid,academicterms.TermlyObject, canteenbills.currentBill,canteenbills.dateposted,canteenbills.isCurrentbill,canteenbills.Department,academicdepartment.DeptName,canteenbills.GradeID, academicgrades.GradeDescription FROM canteenbills LEFT JOIN academicsession ON  canteenbills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  canteenbills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON canteenbills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  canteenbills.GradeID=academicgrades.SerialNumber'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                          if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.get('/CanteenCurrentBills', (req, res) => {


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
            query = 'SELECT canteenbills.sn,canteenbills.cbillNumber,canteenbills.sessionID,academicsession.ac_session,canteenbills.Tid,academicterms.TermlyObject, canteenbills.currentBill,canteenbills.dateposted,canteenbills.isCurrentbill,canteenbills.Department,academicdepartment.DeptName,canteenbills.GradeID, academicgrades.GradeDescription FROM canteenbills LEFT JOIN academicsession ON  canteenbills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  canteenbills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON canteenbills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  canteenbills.GradeID=academicgrades.SerialNumber WHERE canteenbills.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// dropCanteenBill
router.post('/dropCanteenBill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  canteenbills WHERE cbillNumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})







router.post('/submitCanteenBiil', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM canteenbills WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {
                        console.log(results)
                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE canteenbills SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO canteenbills (cbillNumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID)VALUES(?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})

// Destination details
// newDestination


router.post('/newDestination', (req, res) => {
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
            query = 'SELECT destnname FROM bussdestination WHERE destnname=?'
            connection.query(query, [data.newDestination], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(201).json({ message: 'Destination already registered' })
                    } else {
                        query = 'INSERT INTO bussdestination(destid,destnname,destDetails,date)VALUES(?,?,?,?)'
                        connection.query(query, [data.destinationID, data.newDestination, data.desitnationDetails, data.date], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    return res.status(201).json({ success: 'Destination successfuly created' })
                                } else {
                                    return res.status(201).json({ message: 'An error has occured. Try again' })
                                }
                            }
                        })
                    }
                }
            })

        }
    })
})


router.get('/loadDesitnation', (req, res) => {
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
            query = 'SELECT destid,destnname,destDetails,date FROM bussdestination'
            connection.query(query, (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        connection.release()
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(201).json({ message: 'No Destinations Registered' })
                    }
                }
            })

        }
    })
})

// setting buss fee




router.get('/getBussBillhistory', (req, res) => {


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
            query = 'SELECT Bussbills.sn,Bussbills.bussbillNumber,Bussbills.Destination,Bussbills.sessionID,academicsession.ac_session,Bussbills.Tid,academicterms.TermlyObject, Bussbills.currentBill,Bussbills.dateposted,Bussbills.isCurrentbill,Bussbills.Department,academicdepartment.DeptName,Bussbills.GradeID, academicgrades.GradeDescription FROM Bussbills LEFT JOIN academicsession ON  Bussbills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  Bussbills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON Bussbills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  Bussbills.GradeID=academicgrades.SerialNumber'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.get('/getBussCurrentBills', (req, res) => {


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
            query = ' Bussbills.sn,Bussbills.bussbillNumber,Bussbills.Destination,Bussbills.sessionID,academicsession.ac_session,Bussbills.Tid,academicterms.TermlyObject, Bussbills.currentBill,Bussbills.dateposted,Bussbills.isCurrentbill,Bussbills.Department,academicdepartment.DeptName,Bussbills.GradeID, academicgrades.GradeDescription FROM Bussbills LEFT JOIN academicsession ON  Bussbills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  Bussbills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON Bussbills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  Bussbills.GradeID=academicgrades.SerialNumber WHERE Bussbills.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// dropCanteenBill
router.post('/dropBussBill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  Bussbills WHERE bussbillNumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})







router.post('/submitBussBiil', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM Bussbills WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {
                        console.log(results)
                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE Bussbills SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO Bussbills (bussbillNumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID,Destination)VALUES(?,?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade, data.selectedDestination], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})

// PTA Bills code

router.get('/ptabillhistory', (req, res) => {


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
            query = 'SELECT ptadues.sn,ptadues.ptabillnumber,ptadues.sessionID,academicsession.ac_session,ptadues.Tid,academicterms.TermlyObject, ptadues.currentBill,ptadues.dateposted,ptadues.isCurrentbill,ptadues.Department,academicdepartment.DeptName,ptadues.GradeID, academicgrades.GradeDescription FROM ptadues LEFT JOIN academicsession ON  ptadues.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  ptadues.Tid=academicterms.Tid LEFT JOIN academicdepartment ON ptadues.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  ptadues.GradeID=academicgrades.SerialNumber'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.get('/ptaCurrentBills', (req, res) => {


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
            query = 'SELECT ptadues.sn,ptadues.ptabillnumber,ptadues.sessionID,academicsession.ac_session,ptadues.Tid,academicterms.TermlyObject, ptadues.currentBill,ptadues.dateposted,ptadues.isCurrentbill,ptadues.Department,academicdepartment.DeptName,ptadues.GradeID, academicgrades.GradeDescription FROM ptadues LEFT JOIN academicsession ON  ptadues.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  ptadues.Tid=academicterms.Tid LEFT JOIN academicdepartment ON ptadues.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  ptadues.GradeID=academicgrades.SerialNumber WHERE ptadues.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


router.post('/dropptaBill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  ptadues WHERE ptabillnumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})







router.post('/submitptaBiil', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM ptadues WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {
                        console.log(results)
                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE ptadues SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO ptadues (ptabillnumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID)VALUES(?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})




// special levey code


router.get('/speciallevyhistory', (req, res) => {


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
            query = 'SELECT speciallevy.sn,speciallevy.lavynumber,speciallevy.sessionID,speciallevy.levydetails,academicsession.ac_session,speciallevy.Tid,academicterms.TermlyObject, speciallevy.currentBill,speciallevy.dateposted,speciallevy.isCurrentbill,speciallevy.Department,academicdepartment.DeptName,speciallevy.GradeID, academicgrades.GradeDescription FROM speciallevy LEFT JOIN academicsession ON  speciallevy.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  speciallevy.Tid=academicterms.Tid LEFT JOIN academicdepartment ON speciallevy.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  speciallevy.GradeID=academicgrades.SerialNumber'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                       if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.get('/sepciallevyCurrentBills', (req, res) => {


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
            query = 'SELECT speciallevy.sn,speciallevy.lavynumber,speciallevy.sessionID,speciallevy.levydetails,academicsession.ac_session,speciallevy.Tid,academicterms.TermlyObject, speciallevy.currentBill,speciallevy.dateposted,speciallevy.isCurrentbill,speciallevy.Department,academicdepartment.DeptName,speciallevy.GradeID, academicgrades.GradeDescription FROM speciallevy LEFT JOIN academicsession ON  speciallevy.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  speciallevy.Tid=academicterms.Tid LEFT JOIN academicdepartment ON speciallevy.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  speciallevy.GradeID=academicgrades.SerialNumber WHERE speciallevy.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


router.post('/dropsepciallevy', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  speciallevy WHERE lavynumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})







router.post('/submitspeciallevy', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM speciallevy WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {
                        console.log(results)
                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE speciallevy SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO speciallevy (lavynumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID,levydetails)VALUES(?,?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade, data.levydetails], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})




///uniforms code


router.post('/newuniform', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    pool.getConnection((err, connection) => {
        console.log(data)
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT uniformname FROM Uniforms WHERE uniformname=?'
            connection.query(query, [data.uniformName], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(201).json({ message: 'Destination already registered' })
                    } else {
                        query = 'INSERT INTO Uniforms(uniformid,uniformname, uniformdetails,date)VALUES(?,?,?,?)'
                        connection.query(query, [data.uniformID, data.uniformName, data.uniformDetails, data.date], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.affectedRows > 0) {
                                    return res.status(201).json({ success: 'Destination successfuly created' })
                                } else {
                                    return res.status(201).json({ message: 'An error has occured. Try again' })
                                }
                            }
                        })
                    }
                }
            })

        }
    })
})


router.get('/loaduniforms', (req, res) => {
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
            query = 'SELECT uniformid,uniformname, uniformdetails,date FROM Uniforms'
            connection.query(query, (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        connection.release()
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(201).json({ message: 'No Destinations Registered' })
                    }
                }
            })

        }
    })
})




router.post('/submituniformbill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT sessionID,Tid,Department,GradeID FROM uniformbilling WHERE sessionID=? AND Tid=? AND Department=? AND GradeID=?'
            connection.query(query, [data.academicyear, data.term, data.department, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {

                    if (results.length > 0) {

                        connection.release()
                        return res.status(201).json({ message: 'Bill for this term has already been submitted' })
                    } else {
                        query = 'UPDATE uniformbilling SET isCurrentbill=? WHERE isCurrentbill=?'
                        connection.query(query, [false, true], (error, results) => {
                            if (error) {
                                console.log(error)
                                connection.release()
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                query = 'INSERT INTO uniformbilling (uniformbillnumber,sessionID,Tid,currentBill,dateposted,isCurrentbill,Department,GradeID,uniformid,uniformdetails)VALUES(?,?,?,?,?,?,?,?,?,?)'
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade, data.uniformid, data.uniformdetails], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        connection.release()
                                        return res.status(201).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.affectedRows > 0) {
                                            connection.release()
                                            return res.status(200).json({ success: 'Account successfuly updated' })
                                        } else {
                                            connection.release()
                                            return res.status(200).json({ message: 'Something went wrong. Bill could not be submitted' })
                                        }

                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})



// 

router.get('/uniformsHistory', (req, res) => {


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
            console.log('loading uniforms')
            query = 'SELECT uniformbilling.sn,uniformbilling.uniformbillnumber,uniformbilling.sessionID,uniformbilling.uniformdetails,academicsession.ac_session,uniformbilling.Tid,academicterms.TermlyObject, uniformbilling.currentBill,uniformbilling.dateposted,uniformbilling.isCurrentbill,uniformbilling.Department,academicdepartment.DeptName,uniformbilling.GradeID, academicgrades.GradeDescription,Uniforms.uniformname FROM uniformbilling LEFT JOIN academicsession ON  uniformbilling.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  uniformbilling.Tid=academicterms.Tid LEFT JOIN academicdepartment ON uniformbilling.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  uniformbilling.GradeID=academicgrades.SerialNumber LEFT JOIN uniforms ON uniformbilling.uniformid=uniforms.uniformid'
            connection.query(query, (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})



router.get('/uniformscurrentbill', (req, res) => {


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
            query = 'SELECT uniformbilling.sn,uniformbilling.uniformbillnumber,uniformbilling.sessionID,uniformbilling.uniformdetails,academicsession.ac_session,uniformbilling.Tid,academicterms.TermlyObject, uniformbilling.currentBill,uniformbilling.dateposted,uniformbilling.isCurrentbill,uniformbilling.Department,academicdepartment.DeptName,uniformbilling.GradeID, academicgrades.GradeDescription,Uniforms.uniformname FROM uniformbilling LEFT JOIN academicsession ON  uniformbilling.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  uniformbilling.Tid=academicterms.Tid LEFT JOIN academicdepartment ON uniformbilling.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  uniformbilling.GradeID=academicgrades.SerialNumber LEFT JOIN uniforms ON uniformbilling.uniformid=uniforms.uniformid WHERE uniformbilling.isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


router.post('/dropuniformBill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM  uniformbilling WHERE uniformbillnumber=? '
            connection.query(query, [data.billID], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})



// Preparing bills for learners
// 


router.get('/termdetails', (req, res) => {


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
            query = 'SELECT schoolfeebills.billNumber,schoolfeebills.sessionID,schoolfeebills.Tid,schoolfeebills.currentBill,schoolfeebills.isCurrentbill,schoolfeebills.Department, academicsession.ac_session, academicterms.TermlyObject, academicdepartment.DeptName FROM schoolfeebills LEFT JOIN academicsession ON schoolfeebills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON schoolfeebills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON schoolfeebills.Department=academicdepartment.DeptId WHERE isCurrentbill=?'
            connection.query(query, [true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {

                        return res.status(200).json({ data: results })
                    } else {
                        console.log('record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})




router.post('/loadCurrentFee', (req, res) => {
    let data = req.body

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
            query = 'SELECT schoolfeebills.billNumber,schoolfeebills.currentBill,schoolfeebills.isCurrentbill FROM schoolfeebills WHERE schoolfeebills.Tid=?  AND schoolfeebills.isCurrentbill=?  AND GradeID=?'
            connection.query(query, [data.term, true, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// 
// loadarrears
router.post('/loadarrear', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT currentBalance FROM school_fee_payments WHERE AdmissionNumber=? AND isCurrentbillStatus=?'
            connection.query(query, [data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('no records')
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})

// submitcurrentbill

router.post('/submitcurrentbill', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
             console.log('validation error')
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM school_fee_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM school_fee_schedule WHERE billNumber=?'
                        connection.query(query, [data.billID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    console.log('billed for this term')
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO school_fee_schedule (billNumber,AdmissionNumber,sessionID,Tid, Academicgrade, arrears, currentBill, totalBill, dateposted, isCurrentbill,Department)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/leanerFeeHistory', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM school_fee_schedule WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                          if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/dropLearnerbill', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM school_fee_schedule WHERE AdmissionNumber=?'
              connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})










//Canteen fee preparation information 
// ====================================================================================================================================================
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




router.post('/loadCurrentCanteenbill_schedule', (req, res) => {
    let data = req.body
console.log('data to cbill',data)
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
            query = 'SELECT canteenbills.cbillNumber,canteenbills.currentBill,canteenbills.isCurrentbill FROM canteenbills WHERE canteenbills.Tid=?  AND canteenbills.isCurrentbill=?  AND canteenbills.GradeID=?'
            connection.query(query, [data.term, true, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('cbill found',results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('c record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})

//Prepare arears

router.post('/Loadcateen_fee_arears', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT TermlyBalance FROM canteen_fee_payment WHERE AdmissionNumber=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(200).json({ data: results })
                    } else {
                     let data={
                        arrearValue:0
                     }
                        return res.json({ Norecord: data })
                    }
                }
            })
        }
    })
})


// submitcurrentbill

router.post('/submitcurrentCanteenfee_schedule', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' submitting data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,dailyBill,weeklyBill,MonthlyBill,totalTermBill,TotalCanteenFee,dateposted,isCurrentbill,Department' +
                ' FROM canteen_fee_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM school_fee_schedule WHERE billNumber=?'
                        connection.query(query, [data.billID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO canteen_fee_schedule (billNumber, AdmissionNumber, sessionID, Tid, Academicgrade,arrears, dailyBill, weeklyBill, MonthlyBill, totalTermBill,TotalCanteenFee, dateposted, isCurrentbill, Department)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee,data.weeklyAmount,data.monthlyAmount,data.termlyAmount, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/loadcanteenfeehistory_schedule', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,dailyBill,weeklyBill,MonthlyBill,totalTermBill,TotalCanteenFee,dateposted,isCurrentbill,Department' +
                ' FROM canteen_fee_schedule WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                          if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/dropcanteefee_schedule', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM canteen_fee_payment WHERE AdmissionNumber=?'
              connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})



// Selecting number of days in term
router.post('/loadDaysinTerm', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body
console.log('Term Data: ',data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT DaysinTerm FROM termbegins WHERE AcademicYear=? AND OpenedTerm=? AND isCurrent=?'
              connection.query(query, [data.academicYear,data.term,1], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('Academic Term Begins data', results)
                        connection.release()
                        return res.status(200).json({ data:results })
                    } else {
                        console.log('begins not found')
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})


// creating bus bill structure 


//bus fee preparation information 
// ====================================================================================================================================================
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




router.post('/load_Current_Bus_bill_schedule', (req, res) => {
    let data = req.body
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
            query = 'SELECT bussbills.bussbillNumber,bussbills.currentBill,bussbills.isCurrentbill FROM bussbills WHERE bussbills.Tid=?  AND bussbills.isCurrentbill=?  AND bussbills.GradeID=?'
            connection.query(query, [data.term, true, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('c record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})

//Prepare arears

router.post('/Load_bus_fee_arears', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT TermlyBalance FROM bus_fee_payment WHERE AdmissionNumber=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        return res.status(200).json({ data: results })
                    } else {
                
                        return res.json({ Norecord: data })
                    }
                }
            })
        }
    })
})


// submitcurrentbill

router.post('/submit_current_fee_schedule', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' submitting data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,dailyBill,weeklyBill,MonthlyBill,totalTermBill,TotalCanteenFee,dateposted,isCurrentbill,Department' +
                ' FROM bus_fee_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM bus_fee_schedule WHERE billNumber=?'
                        connection.query(query, [data.billID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO bus_fee_schedule (billNumber, AdmissionNumber, sessionID, Tid, Academicgrade,arrears, dailyBill, weeklyBill, MonthlyBill, totalTermBill,TotalCanteenFee, dateposted, isCurrentbill, Department)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee,data.weeklyAmount,data.monthlyAmount,data.termlyAmount, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/load_bus_fee_history_schedule', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,dailyBill,weeklyBill,MonthlyBill,totalTermBill,TotalCanteenFee,dateposted,isCurrentbill,Department' +
                ' FROM bus_fee_schedule WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                      if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                    }
                }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/drop_bus_fee_schedule', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM bus_fee_schedule WHERE AdmissionNumber=?'
              connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})

// Preparing PTA dues schedules
// /=============================================================================================================================================================================
// ==============================================================================================================================================================================
// ==============================================================================================================================================================================




router.post('/load_current_PTA_Due', (req, res) => {
    let data = req.body

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
            query = 'SELECT ptabillnumber,currentBill,isCurrentbill FROM ptadues WHERE Tid=?  AND isCurrentbill=?  AND GradeID=?'
            connection.query(query, [data.term, true, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// 
// loadarrears
router.post('/Load_PTA_Arrears', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT currentBalance FROM pta_due_payments WHERE AdmissionNumber=? AND isCurrentbillStatus=?'
            connection.query(query, [data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('no records')
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})

// submitcurrentbill

router.post('/submit_PTA_Bill', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
             console.log('validation error')
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM pta_due_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM pta_due_schedule WHERE billNumber=?'
                        connection.query(query, [data.billID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    console.log('billed for this term')
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO pta_due_schedule (billNumber,AdmissionNumber,sessionID,Tid, Academicgrade, arrears, currentBill, totalBill, dateposted, isCurrentbill,Department)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/Load_PTA_Dues_History', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM pta_due_schedule WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                      }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/Drop_PTA_Due', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM pta_due_schedule WHERE AdmissionNumber=?'
              connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})




// Preparing uniform bill schedules
// /=============================================================================================================================================================================
// ==============================================================================================================================================================================
// ==============================================================================================================================================================================




router.post('/load_current_uniform_bill', (req, res) => {
    let data = req.body
console.log('uniform: ',data)
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
            query = 'SELECT uniformbillnumber,uniformid,currentBill,isCurrentbill FROM uniformbilling WHERE Tid=?  AND isCurrentbill=?  AND GradeID=? AND uniformid=?'
            connection.query(query, [data.term, true, data.grade,data.uniformid], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// 
// loadarrears
router.post('/Load_uniform_Arrears', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT currentBalance FROM Uniform_Bill_Payments WHERE AdmissionNumber=? AND isCurrentbillStatus=? AND uniformid=?'
            connection.query(query, [data.AdmissionNumber, true,data.uniformid], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('no records')
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})

// submitcurrentbill

router.post('/submit_uniform_Bill', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
             console.log('validation error')
            query = 'SELECT billNumber,uniformid,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM uniform_bill_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=? AND uniformid=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true,data.uniformid], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM uniform_bill_schedule WHERE billNumber=?  AND uniformid=?'
                        connection.query(query, [data.billID,data.uniformid], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    console.log('billed for this term')
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO uniform_bill_schedule (billNumber,AdmissionNumber,sessionID,Tid, Academicgrade, arrears, currentBill, totalBill, dateposted, isCurrentbill,Department,uniformid)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department,data.uniformid], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/Load_uniform_Dues_History', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT uniform_bill_schedule.billNumber,uniform_bill_schedule.uniformid,uniform_bill_schedule.AdmissionNumber,uniform_bill_schedule.sessionID,uniform_bill_schedule.Tid,uniform_bill_schedule.Academicgrade,uniform_bill_schedule.arrears,uniform_bill_schedule.currentBill,uniform_bill_schedule.totalBill,uniform_bill_schedule.dateposted,uniform_bill_schedule.isCurrentbill,uniform_bill_schedule.Department, uniforms.uniformname' +
                ' FROM uniform_bill_schedule LEFT JOIN uniforms ON uniform_bill_schedule.uniformid=uniforms.uniformid WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                      }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/Drop_uniform_Due', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM uniform_bill_schedule WHERE AdmissionNumber=? AND uniformid=?'
              connection.query(query, [data.AdmissionNumber,data.uniformid], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})






// Preparing special  levy schedules
// /=============================================================================================================================================================================
// ==============================================================================================================================================================================
// ==============================================================================================================================================================================




router.post('/load_current_special_levy', (req, res) => {
    let data = req.body
console.log('speciao levy: ',data)
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
            query = 'SELECT lavynumber,currentBill,isCurrentbill FROM speciallevy WHERE Tid=?  AND isCurrentbill=?  AND GradeID=?'
            connection.query(query, [data.term, true, data.grade], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('record not found')
                        res.status(200).json({ message: 'No records available' })
                    }
                }
            })


        }


    })
})


// 
// loadarrears
router.post('/Load_special_levy_Arrears', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT currentBalance FROM special_levy_payments WHERE AdmissionNumber=? AND isCurrentbillStatus=?'
            connection.query(query, [data.AdmissionNumber, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log(results)
                        return res.status(200).json({ data: results })
                    } else {
                        console.log('no records')
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})

// submitcurrentbill

router.post('/submit_special_levy', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
             console.log('validation error')
            query = 'SELECT billNumber,AdmissionNumber,sessionID,Tid,Academicgrade,arrears,currentBill,totalBill,dateposted,isCurrentbill,Department' +
                ' FROM special_levy_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=? AND Academicgrade=? AND Department=? AND isCurrentbill=?'
            connection.query(query, [data.AdmissionNumber, data.academicyear, data.term, data.grade, data.Department, true], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('billed for this term')
                        return res.status(200).json({ message: 'School fee has alreay bee prepared for this learner' })
                    } else {
                        query = 'SELECT  * FROM special_levy_schedule WHERE billNumber=?'
                        connection.query(query, [data.billID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(201).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {
                                    console.log('billed for this term')
                                    return res.status(200).json({ message: 'Duplicate bill Number. trye again' })
                                } else {
                                    console.log('insertion error')
                                    query = 'INSERT INTO special_levy_schedule (billNumber,AdmissionNumber,sessionID,Tid, Academicgrade, arrears, currentBill, totalBill, dateposted, isCurrentbill,Department)VALUES(?,?,?,?,?,?,?,?,?,?,?)'
                                    connection.query(query, [data.billID, data.AdmissionNumber, data.academicyear, data.term, data.grade, data.arrears, data.currentFee, data.amountDue, data.dateDeposit, data.isCurrentBill, data.Department], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(201).json({ message: error.sqlMessage })
                                        } else {
                                            if (results.affectedRows > 0) {
                                                return res.status(200).json({ success: 'Bill details successfully added' })
                                            } else {
                                                console.log('unknown error')
                                                return res.status(201).json({ message: 'Unknown error has occured. Try again' })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

router.post('/Load_special_levy_History', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'SELECT special_levy_schedule.billNumber,special_levy_schedule.AdmissionNumber,special_levy_schedule.sessionID,special_levy_schedule.Tid,special_levy_schedule.Academicgrade,special_levy_schedule.arrears,special_levy_schedule.currentBill,special_levy_schedule.totalBill,special_levy_schedule.dateposted,special_levy_schedule.isCurrentbill,special_levy_schedule.Department' +
                ' FROM special_levy_schedule WHERE AdmissionNumber=?'
            connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    if (results.length > 0) {
                        console.log('results found')
                      for(let i=0;i<results.length;i++){
                        if(results[i].isCurrentbill===1){
                           results[i].isCurrentbill=true 
                        }else{
                            results[i].isCurrentbill=false
                        }
                      }
                        return res.status(200).json({ data: results })
                    } else {
                    
                        return res.json({ Norecord: 'No records' })
                    }
                }
            })
        }
    })
})





router.post('/Drop_special_levy', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    let data = req.body

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query = 'DELETE FROM special_levy_schedule WHERE AdmissionNumber=?'
              connection.query(query, [data.AdmissionNumber], (error, results) => {
                if (error) {
                    console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                } else {
                    console.log(results)
                    if (results.affectedRows > 0) {

                        connection.release()
                        return res.status(200).json({ success: 'Bill successfuly deleted' })
                    } else {
                        connection.release()
                        return res.status(200).json({ message: 'Something went wrong. Bill could not be deleted' })
                    }

                }
            })
        }
    })
})


// Generating bill details
// ======================================================================================================================================================================
// ======================================================================================================================================================================
// ......................................................................................................................................................................


router.post('/generatebill', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT currentBill, arrears,totalBill FROM school_fee_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?  AND isCurrentbill=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term,true],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                        console.log('fee',results)
                        return res.status(200).json({data:results})
                    }else{
                        console.log('No Results')
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})



router.post('/loadPtaDues', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT currentBill, arrears,totalBill FROM pta_due_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?  AND isCurrentbill=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term,true],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                            console.log('pta ',results)
                        return res.status(200).json({data:results})
                    }else{
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})


router.post('/specialLevy', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT currentBill, arrears,totalBill FROM special_levy_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?  AND isCurrentbill=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term,true],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                            console.log('speciallevy',results)
                        return res.status(200).json({data:results})
                    }else{
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})



router.post('/uniformcost', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT currentBill, arrears,totalBill FROM uniform_bill_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                        console.log('uniforms',results)
                        return res.status(200).json({data:results})
                    }else{
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})




router.post('/busfee', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT currentBill, arrears,totalBill FROM pta_due_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?  AND isCurrentbill=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term,true],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                            console.log('bus',results)
                        return res.status(200).json({data:results})
                    }else{
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})




router.post('/Canteen', (req, res) => {
    let data = req.body

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    console.log(' Data', data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err)
            connection.release()
            console.error('Error getting connection from pool:', err);
            return;
        } else {
            query='SELECT dailyBill,number_of_days, arrears,TotalCanteenFee FROM canteen_fee_schedule WHERE AdmissionNumber=? AND sessionID=? AND Tid=?  AND isCurrentbill=?'
            connection.query(query,[data.AdmissionNumber,data.academicYear,data.term,true],(error,results)=>{
                if(error){
                      console.log(error)
                    connection.release()
                    return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                            console.log('canteen',results)
                        return res.status(200).json({data:results})
                    }else{
                        return res.status(201).json({message:'Results not found'})
                    }
                }
            })


        }
    })
})
module.exports = router
