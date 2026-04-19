
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
                                            return res.status(200).json({ success: 'Something went wrong. Bill could not be submitted' })
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
                        return res.status(200).json({ success: 'Something went wrong. Bill could not be deleted' })
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
                        return res.status(200).json({ success: 'Something went wrong. Bill could not be deleted' })
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
                                            return res.status(200).json({ success: 'Something went wrong. Bill could not be submitted' })
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
                        return res.status(200).json({ success: 'Something went wrong. Bill could not be deleted' })
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
                                            return res.status(200).json({ success: 'Something went wrong. Bill could not be submitted' })
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
                        return res.status(200).json({ success: 'Something went wrong. Bill could not be deleted' })
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
                                            return res.status(200).json({ success: 'Something went wrong. Bill could not be submitted' })
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
                        return res.status(200).json({ success: 'Something went wrong. Bill could not be deleted' })
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
                                connection.query(query, [data.billID, data.academicyear, data.term, data.currentBill, data.datePosted, data.isCurrentBill, data.department, data.grade,data.levydetails], (error, results) => {
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
                                            return res.status(200).json({ success: 'Something went wrong. Bill could not be submitted' })
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
module.exports = router
