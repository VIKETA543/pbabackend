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

router.post('/admissions', (req, res) => {
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

    query = "SELECT applicationNumber, applicantSurname, applicantMiddlename,applicantLastname,DateApplied FROM applicantbiodata"
    connection.query(query, (error, results) => {

        if (error) {
            res.status(500).json({ message: "The Server encountered an internal error the prevented your request to be served" })
        } else {
            console.log(results[0])
            res.status(200).json({
                appNumber: results[0].applicationNumber,
                Surname: results[0].applicantSurname,
                Middlename: results[0].applicantMiddlename,
                Lastname: results[0].applicantLastname,
                applicationDate: results[0].DateApplied
            })
        }
    })

})
})
router.post('/index', (req, res) => {

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

    query = "SELECT IndexNumber FROM prospectivelearners ORDER BY IndexNumber DESC LIMIT 1 "
    connection.query(query, (error, results) => {
        if (error) {

            res.status(500).json({ message: error.sqlMessage })
        } else {
            if (results.length <= 0) {
                res.status(200).json({ index: 1 })
            } else {

                let index = results[0].IndexNumber;
                res.status(200).json({ index: index + 1 })
            }
        }
    })
})
})

router.post('/confirmAdmission', (req, res) => {
    console.log(req.body)
    const data = req.body
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

    query = "INSERT INTO prospectivelearners (SerialNumber,AdmissionNumber,IndexNumber,AdmissionDate,AssignedClass,Confirmed) VALUES(?,?,?,?,?,?)"
    connection.query(query, [data.applicationNumber, data.AdmissionNumber, data.RowIndex, data.AdmissionDate, data.AssignedClass, data.AdmisionConfirmed], (error, results) => {
        if (error) {
            // res.status(500).json({ message: error.sqlMessage })
            return res.status(500).json({ message: error.sqlMessage })
        } else {
            return res.status(200).json({ message: "Admission successfully granted. Go to system dashboard to print admisson letter" })

        }
    })

})

})

router.post('/admissions-register', (req, res) => {
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

    query = "SELECT prospectivelearners.AdmissionNumber,applicantbiodata.applicantSurname, applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname," +
        "prospectivelearners.AdmissionDate,prospectivelearners.AssignedClass,prospectivelearners.Confirmed FROM applicantbiodata LEFT JOIN prospectivelearners ON applicantbiodata.applicationNumber=prospectivelearners.SerialNumber WHERE prospectivelearners.Confirmed=?"
    connection.query(query, ['Confirmed'], (error, results) => {

        if (error) {
            console.log(error)
            res.status(500).json({ message: "The Server encountered an internal error the prevented your request to be served" })
        } else {
            let status;

            if (results[0].Confirmed === 'Confirmed') {
                status = 'Admitted'
            } else {
                status = results[0].Confirmed
            }
            res.status(200).json({
                AdmissionNumber: results[0].AdmissionNumber,
                Surname: results[0].applicantSurname,
                Middlename: results[0].applicantMiddlename,
                Lastname: results[0].applicantLastname,
                Admisiondate: results[0].AdmissionDate,
                ClassAssigned: results[0].AssignedClass,
                LearnerStatus: status

            })
        }
    })
})
})
router.post('/searchregistry', (req, res) => {
    const data = req.body
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

    query = 'SELECT SerialNumber FROM prospectivelearners WHERE AdmissionNumber=?'
    connection.query(query, [data.admissionnumber], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Wrong Admission Number used' })
        } else {
            if(results.length>0){
            let d = results[0].SerialNumber

            if (results.length > 0) {
                query = "SELECT prospectivelearners.AdmissionNumber,applicantbiodata.applicantSurname, applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname," +
                    "prospectivelearners.AdmissionDate,prospectivelearners.AssignedClass,prospectivelearners.Confirmed FROM applicantbiodata LEFT JOIN prospectivelearners ON applicantbiodata.applicationNumber=prospectivelearners.SerialNumber WHERE prospectivelearners.SerialNumber=? AND prospectivelearners.Confirmed=?"
                connection.query(query, [d, 'Confirmed'], (error, results) => {
                    if (error) {
                        res.status(500).json({ message: "The Server encountered an internal error the prevented your request to be served" })
                    } else {
                        let status;
                        if (results[0].Confirmed === 'Confirmed') {
                            status = 'Admitted'
                        } else {
                            status = results[0].Confirmed
                        }
                        res.status(200).json({
                            AdmissionNumber: results[0].AdmissionNumber,
                            Surname: results[0].applicantSurname,
                            Middlename: results[0].applicantMiddlename,
                            Lastname: results[0].applicantLastname,
                            Admisiondate: results[0].AdmissionDate,
                            ClassAssigned: results[0].AssignedClass,
                            LearnerStatus: status
                        })
                    }
                })
            } else {
                res.status(500).json({ error: 'A results not found' })
            }
        }else{
                res.status(200).json({ error: 'A results not found' }) 
        }
    }
    })
   })

})
router.post('/add-registry', (req, res) => {

    const data = req.body
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

    query = "INSERT INTO admissionregister(AdmissionNumber,GuardianName,GuardianAddress,GuardianPhone,LastSchool,LastAttendanceDate,couseofLeavingtheschool,AdditionalInformation)VALUES(?,?,?,?,?,?,?,?)"
    connection.query(query, [data.AdmissionNumber, data.Guardian, data.GuardianAddress, data.PhoneNumber, data.LastSchool, data.LastAttendanceDate, data.causeofLeaving, data.remarks], (error, results) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: error.sqlMessage })
        } else {

            return res.status(200).json({ message: "Registry updated successfully" })
        }
    })
})
})

router.post('/admission-detials', (req, res) => {
    const data = req.body
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

    query = "SELECT prospectivelearners.AdmissionNumber,prospectivelearners.AdmissionDate,applicantbiodata.applicantDateofBirth,applicantbiodata.applicantSurname, applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,prospectivelearners.Confirmed,admissionregister.GuardianName," +
        "admissionregister.GuardianAddress,admissionregister.LastSchool,admissionregister.GuardianPhone,admissionregister.LastAttendanceDate,admissionregister.couseofLeavingtheschool,admissionregister.AdditionalInformation FROM applicantbiodata LEFT JOIN prospectivelearners ON applicantbiodata.applicationNumber=prospectivelearners.SerialNumber LEFT JOIN admissionregister ON prospectivelearners.AdmissionNumber=admissionregister.AdmissionNumber WHERE prospectivelearners.Confirmed=? AND admissionregister.AdmissionNumber=? "
    connection.query(query, ['Confirmed', data.admissionnumber], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.sqlState })
        } else {
            if (results.length > 0) {
                return res.status(200).json({
                    AdmissionNumber: results[0].AdmissionNumber,
                    AdmissionDate: results[0].AdmissionDate,
                    applicantDateofBirth: results[0].applicantDateofBirth,
                    applicantSurname: results[0].applicantSurname,
                    applicantMiddlename: results[0].applicantMiddlename,
                    applicantLastname: results[0].applicantLastname,
                    Confirmed: results[0].Confirmed,
                    GuardianName: results[0].GuardianName,
                    GuardianAddress: results[0].GuardianAddress,
                    LastSchool: results[0].LastSchool,
                    GuardianPhone: results[0].GuardianPhone,
                    LastAttendanceDate: results[0].LastAttendanceDate,
                    couseofLeavingtheschool: results[0].couseofLeavingtheschool,
                    AdditionalInformation: results[0].AdditionalInformation
                })
            }
        }
    })
})
})

router.post('/finddrawal', (req, res) => {
    const data = req.body
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

    query = "SELECT SerialNumber FROM prospectivelearners WHERE AdmissionNumber=?"
    connection.query(query, [data.AdmisionNumber], (error, results) => {
        if (error) {

            return res.status(500).json({ message: error.sqlMessage })
        } else {

            if (results.length > 0) {

                const q = results[0].SerialNumber
                query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
                    "proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE,proslearner.Confirmed AS STATUS " +
                    "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber " +
                    "WHERE biodata.applicationNumber=?"
                connection.query(query, [q], (error, results) => {
                    if (error) {

                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        if (results.length > 0) {
                            return res.status(200).json({
                                admNo: results[0].ADNO,
                                SN: results[0].SN,
                                MN: results[0].MN,
                                LN: results[0].LN,
                                GRADE: results[0].GRADE,
                                STATUS: results[0].STATUS
                            })

                        } else {
                            return res.status(500).json({ message: "The records your requested could not be found. Check credentials and try again" })
                        }
                    }
                })
            } else {
                return res.status(500).json({ message: "The records your requested could not be found" })
            }
        }
    })
})
})
router.post('/withdrawLearner', (req, res) => {
    console.log(req.body)
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

    const data = req.body
    query = "INSERT INTO admissionwidrawals(AdmissionNumber,DateWithDrawn,Reasons,DetailedInformation,GuardianName,GuardianContact,Confrimed,ConfirmedBy)" +
        "VALUES(?,?,?,?,?,?,?,?)"
    connection.query(query, [data.admissionnumber, data.withdrawnDate, data.reasonforwithdrwal, data.details, data.guardianName, data.GuardianContact, data.confirmed, data.confirmBy], (error, results) => {
        if (error) {

            return res.status(500).json({ message: error.sqlMessage })
        } else {

            return res.status(200).json({ message: "Withdrawal successfull" })
        }
    })

})
})
router.post('/findWithdrawnLearner', (req, res) => {
    const data = req.body
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

    query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
        "proslearner.SerialNumber AS SERIAL,proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE,proslearner.Confirmed AS STATUS, " +
        "Withdrawal.DateWithDrawn as WDATE,Withdrawal.Reasons AS WRES,Withdrawal.DetailedInformation AS DETAILS,Withdrawal.GuardianName AS GUARDIAN,Withdrawal.GuardianContact AS GCONTACT,Withdrawal.WithdrawalLetterIsued AS ADMLETTER, Withdrawal.AuthorisedBy AS AUTHBY,Withdrawal.Confrimed AS CONF, Withdrawal.ConfirmedBy AS CONBY " +
        "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber LEFT JOIN admissionwidrawals  AS Withdrawal ON proslearner.AdmissionNumber=Withdrawal.AdmissionNumber " +
        "WHERE Withdrawal.AdmissionNumber=?"
    connection.query(query, [data.AdmisionNumber], (error, results) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ message: error.sqlMessage })
        } else {

            if (results.length > 0) {
                let data = results[0];
                var srl = data.SERIAL
                query = "SELECT Image FROM passportphotos WHERE SerialNumber=?"
                connection.query(query, [srl], (error, results) => {
                    if (error) {
                        console.log(error)
                    } else {
                        if (results.length > 0) {
                            var buffer = Buffer(results[0].Image);
                            var BufferedBase64 = buffer.toString('base64')


                            return res.status(200).json({ data: data, image: BufferedBase64 })
                        } else {
                            console.log('No Image')
                        }
                    }
                })

            } else {
                return res.status(500).json({ message: 'No Records associated with the admission number entered' })
            }
        }
    })
})
})
router.post('/authoriseWithdrwal', (req, res) => {
    const data = req.body
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

    query = "SELECT Authourised,AuthorisedBy,AdmissionNumber FROM admissionwidrawals WHERE AdmissionNumber=?"
    connection.query(query, [data.admissionnumber], (error, results) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ message: error.sqlMessage })
        } else {
            if (results.length > 0) {
                let status = results[0].Authourised
                if (status === process.env.AUTH_WITHDRAWAL) {
                    res.status(200).json({ message: 'Withdrawal has been authorised by ' + results[0].AuthorisedBy })
                } else {
                    if (status === process.env.DENY_WITHDRAWAL) {
                        res.status(200).json({ message: 'Authorisation was process on this learner, however, request denied by:' + results[0].AuthorisedBy })
                    } else {
                        query = "UPDATE admissionwidrawals SET Authourised=?,AuthorisedBy=?,AuthMessage=? WHERE AdmissionNumber=? "
                        connection.query(query, [data.authstate, data.authBy, data.message, data.admissionnumber], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                return res.status(200).json({ message: "Request was successful" })
                            }
                        })
                    }
                }
            } else {
                res.status(500).json({ message: "Withdrawal was not processed for this learners." })
            }
        }
    })
})
})
router.post('/loadWithdrawnpartialdata', (req, res) => {
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

    query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
        "proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE," +
        "Withdrawal.DateWithDrawn as WDATE " +
        "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber LEFT JOIN admissionwidrawals  AS Withdrawal ON proslearner.AdmissionNumber=Withdrawal.AdmissionNumber"
    connection.query(query, (error, results) => {
        if (error) {
            console.log(error)
            res.status(500).json({ message: error.sqlMessage })
        } else {

            return res.status(200).json({
                SN: results[0].SN,
                MN: results[0].MN,
                LN: results[0].LN,
                ADNO: results[0].ADNO,
                GRADE: results[0].GRADE,
                WDATE: results[0].WDATE
            })
            // 
        }
    })
})
})

router.post('/loadWithdrawnpartialdataSearch', (req, res) => {
    const data = req.body
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

    query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
        "proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE," +
        "Withdrawal.DateWithDrawn as WDATE " +
        "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber LEFT JOIN admissionwidrawals  AS Withdrawal ON proslearner.AdmissionNumber=Withdrawal.AdmissionNumber WHERE Withdrawal.AdmissionNumber=?"
    connection.query(query, [data.AdmisionNumber], (error, results) => {
        if (error) {
            console.log(error)
            res.status(500).json({ message: error.sqlMessage })
        } else {

            return res.status(200).json({
                SN: results[0].SN,
                MN: results[0].MN,
                LN: results[0].LN,
                ADNO: results[0].ADNO,
                GRADE: results[0].GRADE,
                WDATE: results[0].WDATE
            })
            // 
        }
    })
})
})

router.post('/loadWithdrawnPrintableData', (req, res) => {
    let data = req.body
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

    query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
        "proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE," +
        "Withdrawal.DateWithDrawn as WDATE, Withdrawal.Reasons AS REASON, Withdrawal.DetailedInformation AS DET_INFO" +
        ",Withdrawal.GuardianName AS GUADIAN,Withdrawal.GuardianContact AS GUARDIAN_TEL," +
        "Withdrawal.Confrimed AS CONFIRMED, Withdrawal.ConfirmedBy AS OFFICER," +
        "Withdrawal.WithdrawalLetterIsued AS WITHDRAWAL_LETTER,Withdrawal.Authourised AS AUTH," +
        " Withdrawal.AuthorisedBy AS AUTH_BY,Withdrawal.AuthMessage AS AUTH_MES " +
        "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber LEFT JOIN admissionwidrawals  AS Withdrawal ON proslearner.AdmissionNumber=Withdrawal.AdmissionNumber " +
        " WHERE Withdrawal.AdmissionNumber=?"
    connection.query(query, [data.AdmisionNumber], (error, results) => {
        if (error) {
            console.log(error)
            res.status(500).json({ message: error.sqlMessage })
        } else {
            console.log(results)
            return res.status(200).json({
                SN: results[0].SN,
                MN: results[0].MN,
                LN: results[0].LN,
                ADNO: results[0].ADNO,
                GRADE: results[0].GRADE,
                WDATE: results[0].WDATE,
                RES: results[0].REASON,
                DET_INFO: results[0].DET_INFO,
                GUADIAN: results[0].GUADIAN,
                GUARDIAN_TEL: results[0].GUARDIAN_TEL,
                CONFIRMED: results[0].CONFIRMED,
                OFFICER: results[0].OFFICER,
                WITHDRAWN_LETTER: results[0].WITHDRAWN_LETTER,
                AUTH: results[0].AUTH,
                AUTH_ADMIN: results[0].AUTH_BY,
                AUTH_MESS: results[0].AUTH_MES
            })
            // 
        }
    })
})
})
router.post('/loadDetailedRecords', (req, res) => {
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

    query = "SELECT biodata.applicantSurname AS SN,biodata.applicantMiddlename AS MN,biodata.applicantLastname AS LN," +
        "proslearner.AdmissionNumber AS ADNO,proslearner.AssignedClass AS GRADE," +
        "Withdrawal.DateWithDrawn as WDATE, Withdrawal.Reasons AS REASON, Withdrawal.DetailedInformation AS DET_INFO" +
        ",Withdrawal.GuardianName AS GUADIAN,Withdrawal.GuardianContact AS GUARDIAN_TEL," +
        "Withdrawal.Confrimed AS CONFIRMED, Withdrawal.ConfirmedBy AS OFFICER," +
        "Withdrawal.WithdrawalLetterIsued AS WITHDRAWAL_LETTER,Withdrawal.Authourised AS AUTH," +
        " Withdrawal.AuthorisedBy AS AUTH_BY,Withdrawal.AuthMessage AS AUTH_MES " +
        "FROM applicantbiodata  biodata LEFT JOIN prospectivelearners proslearner ON proslearner.SerialNumber=biodata.applicationNumber LEFT JOIN admissionwidrawals  AS Withdrawal ON proslearner.AdmissionNumber=Withdrawal.AdmissionNumber "
    connection.query(query, (error, results) => {
        if (error) {
            console.log(error)
            res.status(500).json({ message: error.sqlMessage })
        } else {
            console.log(results)
            return res.status(200).json({
                SN: results[0].SN,
                MN: results[0].MN,
                LN: results[0].LN,
                ADNO: results[0].ADNO,
                GRADE: results[0].GRADE,
                WDATE: results[0].WDATE,
                RES: results[0].REASON,
                DET_INFO: results[0].DET_INFO,
                GUADIAN: results[0].GUADIAN,
                GUARDIAN_TEL: results[0].GUARDIAN_TEL,
                CONFIRMED: results[0].CONFIRMED,
                OFFICER: results[0].OFFICER,
                WITHDRAWN_LETTER: results[0].WITHDRAWN_LETTER,
                AUTH: results[0].AUTH,
                AUTH_ADMIN: results[0].AUTH_BY,
                AUTH_MESS: results[0].AUTH_MES
            })
            // 
        }
    })
})

})
module.exports = router;