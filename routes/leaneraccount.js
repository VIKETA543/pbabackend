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
        query = "SELECT academicweekslist.WeekDescription,academicterms.TermlyObject,academicsession.ac_session, termbegins.OpenedTerm FROM academicweekslist LEFT JOIN termbegins ON termbegins.WeekOpened=academicweekslist.WeekID LEFT JOIN academicterms ON termbegins.OpenedTerm=academicterms.Tid LEFT JOIN academicsession ON termbegins.AcademicYear=academicsession.sessionID WHERE termbegins.isCurrent=? "
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
            query='SELECT schoolfeebills.sn,schoolfeebills.billNumber,schoolfeebills.sessionID,academicsession.ac_session,schoolfeebills.Tid,academicterms.TermlyObject, schoolfeebills.currentBill,schoolfeebills.dateposted,schoolfeebills.isCurrentbill,schoolfeebills.Department,academicdepartment.DeptName,schoolfeebills.GradeID, academicgrades.GradeDescription FROM schoolfeebills LEFT JOIN academicsession ON  schoolfeebills.sessionID=academicsession.sessionID LEFT JOIN academicterms ON  schoolfeebills.Tid=academicterms.Tid LEFT JOIN academicdepartment ON schoolfeebills.Department=academicdepartment.DeptId LEFT JOIN academicgrades ON  schoolfeebills.GradeID=academicgrades.SerialNumber'
            connection.query(query,(error,results)=>{
                if(error){
                       return res.status(201).json({ message: error.sqlMessage })
                }else{
                    if(results.length>0){
                        return res.status(200).json({data:results})
                    }else{
                        res.status(200).json({message:'No records available'})
                    }
                }
            })


        }
      

    })
})

module.exports = router