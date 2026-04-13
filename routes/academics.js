const express = require("express");
const pool = require('../connection');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const router = express.Router();
var auth = require('../services/authentication')
const checkRole = require("../services/checkRole");
const multer = require('multer');

router.post('/forwardDept', (req, res) => {
    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT DeptId,DeptName,TotalLearners,SpanFrom,SpanTo FROM academicdepartment WHERE SpanFrom=? OR  SpanTo=? OR DeptName=?"
        connection.query(query, [data.fromGrade, data.toGrade, data.departmentName], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {

                    res.status(200).json({ message: 'This Department alredy exist' })
                } else {
                    query = "INSERT INTO academicdepartment(DeptId,DeptName,SpanFrom,SpanTo,TotalLearners,operations) VALUES(?,?,?,?,?,?)"
                    connection.query(query, [data.departmentID, data.departmentName, data.fromGrade, data.toGrade, data.totalLeaners, data.operations], (error, results) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            res.status(200).json({ message: 'Department successfully created' })
                        }
                    })
                }
            }
        })
    })
})

router.post('/findStaff', (req, res) => {
    const data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT FullName,StaffID,contactNumber,email,status,Photo FROM user where StaffID=?"
        connection.query(query, [data.staffId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    var buffer = Buffer(results[0].Photo);
                    var BufferedBase64 = buffer.toString('base64')
                    const user = results[0]
                    if (user.status === 'true') {
                        query = "SELECT DeptId,DeptName FROM academicdepartment"
                        connection.query(query, (error, results) => {
                            if (error) {
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                                    const dept = results
                                    res.status(200).json({ staff: user, departments: dept, image: BufferedBase64 })
                                } else {
                                    return res.status(200).json({ message: "Departments does not exist in the database" })
                                }
                            }
                        })
                    } else {
                        return res.status(200).json({ message: "This user has limited access to be assigned a position" })
                    }
                } else {
                    return res.status(200).json({ message: "No user found for the staff Id entered" })
                }
            }
        })
    })
})
router.post('/forwardNewDeptHead', (req, res) => {

    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT StaffId, AssignedDepartment,Status FROM deptheads WHERE StaffId=? AND AssignedDepartment=? ";
        connection.query(query, [data.staffId, data.selectedDept], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    const status = results[0].Status
                    if (status === process.env.DEPT_HEAD_STATUS) {
                        return res.status(200).json({ message: "This staff has already has a tenure. You only extend the tenure upon expiry" })
                    } else {
                        query = "INSERT INTO  deptheads(StaffId, AssignedDepartment,Tenure,SpanFromDate,SpanToDate,Resposibilities,Status,AssignedBy) VALUES(?,?,?,?,?,?,?,?)"
                        connection.query(query, [data.staffId, data.selectedDept, data.tenureInOffice, data.startDate, data.endDate, data.duties, data.status, data.AssignedBy], (error, results) => {
                            if (error) {
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                return res.status(200).json({ message: "Department head added successfully" })
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO  deptheads(StaffId, AssignedDepartment,Tenure,SpanFromDate,SpanToDate,Resposibilities,Status,AssignedBy) VALUES(?,?,?,?,?,?,?,?)"
                    connection.query(query, [data.staffId, data.selectedDept, data.tenureInOffice, data.startDate, data.endDate, data.duties, data.status, data.AssignedBy], (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            return res.status(200).json({ message: "Department head added successfully" })
                        }
                    })
                }
            }
        })
    })
})
router.post('/loadallDeptHeads', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT academicdepartment.DeptName, user.FullName,user.Photo,deptheads.StaffId,deptheads.AssignedDepartment,deptheads.Tenure,deptheads.TenureStatus AS TN_STATUS," +
            "deptheads.SpanFromDate,deptheads.SpanToDate,deptheads.Resposibilities,deptheads.Status," +
            "deptheads.AssignedBy,deptheads.Authorised,deptheads.AuthorisedBy FROM deptheads LEFT JOIN user on deptheads.StaffId=user.StaffID LEFT JOIN academicdepartment ON deptheads.AssignedDepartment=academicdepartment.DeptId"
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {

                    return res.status(200).json({ data: results })

                } else {
                    return res.status(500).json({ message: "Empty records. Contact System Aministrator" })
                }
            }
        })
    })
})
router.post('/findSelecteddeptHead', (req, res) => {
    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT academicdepartment.DeptName, user.FullName,user.Photo,deptheads.StaffId,deptheads.AssignedDepartment,deptheads.Tenure,deptheads.TenureStatus AS TN_STATUS," +
            "deptheads.SpanFromDate,deptheads.SpanToDate,deptheads.Resposibilities,deptheads.Status," +
            "deptheads.AssignedBy,deptheads.Authorised,deptheads.AuthorisedBy FROM deptheads LEFT JOIN user on deptheads.StaffId=user.StaffID LEFT JOIN academicdepartment ON deptheads.AssignedDepartment=academicdepartment.DeptId " +
            "WHERE deptheads.StaffId=?"
        connection.query(query, [data.search], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    var buffer = Buffer(results[0].Photo);
                    var BufferedBase64 = buffer.toString('base64')
                    return res.status(200).json({ data: results[0], Photo: BufferedBase64 })
                } else {
                    return res.status(200).json({ message: "No results found for the staff Id Entered" })
                }
            }
        })
    })
})
router.post('/authDepartment', (req, res) => {
    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE deptheads SET Authorised=?, AuthorisedBy=? WHERE StaffId=? AND AssignedDepartment=?"
        connection.query(query, [data.access, data.authby, data.staffId, data.DeptId], (error, results) => {
            if (error) {

                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ success: 'Authorisation successful' })
            }
        })
    })
})
router.post('/loadAlldepartments', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT ACDEPT.DeptId AS AC_DEPARTMENT,ACDEPT.DeptName AS AC_DEPT_NAME,ACDEPT.SpanFrom AS AC_SPAN_FROM,ACDEPT.SpanTo AS AC_SPAN_TO,ACDEPT.TotalLearners AS TOTAL_NO_LEARNERS,ACDEPT.operations AS OPS, user.FullName AS DEPTHEADNAME  FROM academicdepartment ACDEPT LEFT JOIN deptheads on ACDEPT.DeptId=deptheads.AssignedDepartment LEFT JOIN user ON user.StaffID=deptheads.StaffId "
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let data = results
                    //   res.status(200).json({ data: data})
                    query = "SELECT Image AS IMG FROM academicdepartment"
                    connection.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                var base64 = Buffer(results);
                                var BufferedBase64 = base64.toString('base64')

                                return res.status(200).json({ data: data, allImages: results })
                            } else {

                            }
                        }
                    })


                } else {
                    return res.status(200).json({ message: "No Records" })
                }
            }
        })
    })
})
router.post('/forwardPosition', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        if (data.access === 0) {
            return res.status(200).json({ message: 'This person has not been authorised to the position yet' })
        } else {
            query = "UPDATE deptheads SET TenureStatus=? WHERE AssignedDepartment=? AND StaffId=? AND Authorised=?"
            connection.query(query, [data.posistion, data.department, data.staff, data.access], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json({ message: error.sqlMessage })
                } else {
                    res.status(200).json({ message: 'Position successfuly set' })
                }

            })
        }
    })
})

router.post('/forwardrenamdepartment', (req, res) => {
    const data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicdepartment SET DeptName=? WHERE DeptId=?"
        connection.query(query, [data.name, data.departmentID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                res.status(200).json({ message: "Rename successful" })
            }
        })
    })
})
router.post('/forwarddeldepartment', (req, res) => {

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "DELETE FROM academicdepartment WHERE  DeptId=?"
        connection.query(query, [data.departmentId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: 'Request was successful' })
            }
        })
    })
})
router.post('/loadhods', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT deptheads.AssignedDepartment,deptheads.TenureStatus,deptheads.Tenure,deptheads.SpanFromDate,deptheads.SpanToDate,deptheads.Status," +
            "user.FullName,user.Photo,academicdepartment.DeptName FROM deptheads LEFT JOIN academicdepartment ON deptheads.AssignedDepartment=academicdepartment.DeptId LEFT JOIN user ON deptheads.StaffId=user.StaffID"
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let data = results
                    query = "SELECT user.Photo FROM deptheads LEFT JOIN  user ON deptheads.StaffId=user.StaffID"
                    connection.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                let image = results

                                return res.status(200).json({ data: data, images: image })
                            } else {
                                return res.status(500).json({ message: "No Images found" })
                            }
                        }
                    })
                } else {
                    return res.status(200).json({ message: 'Records not found' })
                }
            }
        })
    })
})
router.post('/loadOperations', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT operations FROM academicdepartment WHERE DeptId=? "
        connection.query(query, [data.DeptId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    res.status(200).json({ operations: results[0] })
                } else {
                    return res.status(200).json({ no_data: 'Add the operations for this department' })
                }
            }
        })
    })
})
router.post('/updateOPerations', (req, res) => {

    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicdepartment SET  operations=? WHERE DeptId=?"
        connection.query(query, [data.newOperations, data.departmentID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: 'Request was successful' })
            }
        })
    })
})

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/uploadImage', upload.single('image'), (req, res) => {
    const data = req.body
    const img = req.file.buffer
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicdepartment SET Image=? WHERE  DeptId=?"
        connection.query(query, [img, data.DepartmentID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: 'Request was successful' })
            }
        })
    })

})
router.post('/loadFacilitators', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT FAC.StaffId AS STAFFNUMBER,FAC.AssignedGrade AS GRADE, FAC.Status AS CURRENT_POS,FAC.DateAssigned AS DAT_ASS,U.FullName,U.Photo,AC_DEPT.DeptName FROM facilitators  FAC LEFT JOIN user  U ON FAC.StaffId=U.StaffID LEFT JOIN academicdepartment AC_DEPT ON FAC.AssignedDepartment=AC_DEPT.DeptId WHERE AC_DEPT.DeptId=? "
        connection.query(query, [data.data], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let r = results
                    query = "SELECT U.Photo,AC_DEPT.DeptName FROM facilitators  FAC LEFT JOIN user  U ON FAC.StaffId=U.StaffID LEFT JOIN academicdepartment AC_DEPT ON FAC.AssignedDepartment=AC_DEPT.DeptId WHERE AC_DEPT.DeptId=? "
                    connection.query(query, [data.data], (error, results) => {
                        if (error) {


                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                let images = results

                                return res.status(200).json({ data: r, Photo: images })
                            } else {
                                return res.status(200).json({ message: "No Images found" })
                            }
                        }
                    })


                } else {
                    return res.status(200).json({ message: "No Records" })
                }
            }
        })
    })
})
router.post('/loadStaff', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT U.FullName AS NAME,U.StaffID AS ID,U.Photo AS IMAGE FROM user U WHERE U.StaffID=?"
        connection.query(query, [data.staffId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let staff = results[0]
                    query = "SELECT DEPT.DeptName AS DEPTN,DEPT.DeptId AS DEPTID FROM academicdepartment DEPT"
                    connection.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                let dept = results
                                return res.status(200).json({ staff: staff, dept: dept })
                            } else {
                                return res.status(200).json({ message: "No Departments found. Create departments before continuing" })
                            }
                        }
                    })
                } else {
                    return res.status(200).json({ message: "No records for the Id Entered" })
                }
            }
        })
    })
})
router.post('/addnewFacilitator', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "INSERT INTO facilitators (StaffId,AssignedDepartment,Status,DateAssigned) VALUES(?,?,?,?)"
        connection.query(query, [data.staffID, data.deptID, data.status, data.date], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successful" })
            }
        })
    })
})
router.post('/newGrade', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        console.log(data)
        query = "INSERT INTO academicgrades(SerialNumber,GradeDescription,DateAssigned)VALUES(?,?,?)"
        connection.query(query, [data.serialNumber, data.grade, data.date], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successful" })
            }
        })
    })
})

router.post('/loadAllgrades', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT academicgrades.SerialNumber,academicgrades.GradeDescription,academicgrades.DateAssigned,academicgrades.DepartmentID,academicdepartment.DeptName " +
            "FROM academicgrades LEFT JOIN academicdepartment ON academicgrades.DepartmentID=academicdepartment.DeptId " +
            " LEFT JOIN learnerandgrade ON learnerandgrade.GradeId=academicgrades.DepartmentID"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error.sqlMessage)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    // console.log(results)
                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: "No records found" })
                }
            }
        })
    })
})
router.post('/renamegrade', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicgrades SET GradeDescription=? WHERE SerialNumber=?"
        connection.query(query, [data.newName, data.GradeID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ success: "Request was successful" })
            }
        })
    })
})
router.post('/findFacilitator', (req, res) => {
    const data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT FullName,StaffID,contactNumber,email,status,Photo,role FROM user WHERE StaffID=?"
        connection.query(query, [data.staffID,], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {

                if (results.length > 0) {
                    if (results[0].role === 'FACILITATOR') {
                        var buffer = Buffer(results[0].Photo);
                        var BufferedBase64 = buffer.toString('base64')
                        const user = results[0]

                        if (user.status === 'true') {
                            query = "SELECT facilitators.AssignedDepartment,academicdepartment.DeptName FROM  facilitators LEFT JOIN academicdepartment ON facilitators.AssignedDepartment=academicdepartment.DeptId WHERE facilitators.StaffId=?"
                            connection.query(query, [data.staffID], (error, results) => {
                                if (error) {
                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    if (results.length > 0) {

                                        const dept = results
                                        res.status(200).json({ staff: user, departments: dept, image: BufferedBase64 })
                                    } else {
                                        return res.status(200).json({ message: "This staff has not been assigned a department yet!" })
                                    }
                                }
                            })
                        } else {
                            return res.status(200).json({ message: "This user has limited access to be assigned a position" })
                        }
                    }
                    else {
                        return res.status(200).json({ message: "The referring staff is not a facilitator. Change the staff role to Facilitator and continue" })

                    }
                }
                else {
                    return res.status(200).json({ message: "No user found for the staff Id entered" })
                }
            }
        })
    })
})
router.post('/assignedgradefacilitator', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "INSERT INTO assignedfacilitators(StaffId,GradeId,DepartmentId,DateAssigned)VALUES(?,?,?,?)"
        connection.query(query, [data.facilitator, data.gradeid, data.department, data.assignedDate], (error, results) => {
            if (error) {

                return res.status(500).json({ message: error.sqlMessage })
            } else {
                query = "UPDATE facilitators SET AssignedGrade=? WHERE StaffId=? AND status=?"
                connection.query(query, [data.gradeid, data.facilitator, 'CURRENT'], (error, results) => {
                    if (error) {

                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        return res.status(200).json({ success: "Request was successful" })
                    }
                })
            }
        })
    })
})
router.post('/findstafftodel', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT A.StaffId,U.FullName FROM assignedfacilitators A LEFT JOIN user U ON a.StaffId=U.StaffID WHERE A.StaffId=?"
        connection.query(query, [data.factID], (error, results) => {
            if (error) {

                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ success: results[0] })
                } else {
                    return res.status(200).json({ message: "Invalid Facilitator Id Entered" })
                }
            }
        })
    })
})
router.post('/dropfacilitator', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "DELETE FROM assignedfacilitators WHERE StaffId=?"
        connection.query(query, [data.data], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ success: "Facilitator successfuly removed" })
            }
        })
    })
})
router.post('/findLearner', (req, res) => {
    let r = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT prosApp.AdmissionNumber,prosApp.Confirmed,pass.Image," +
            "appBio.applicantSurname,appBio.applicantMiddlename,appBio.applicantLastname " +
            "FROM prospectivelearners prosApp LEFT JOIN passportphotos pass ON prosApp.AdmissionNumber=pass.AdmissionNumber LEFT JOIN applicantbiodata appBio ON prosApp.AdmissionNumber=appBio.AdmissionNumber WHERE prosApp.AdmissionNumber=?"
        connection.query(query, [r.LearnerID], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    if (results[0].Confirmed === "Confirmed") {
                        let data = results[0]
                        return res.status(200).json({ data: data });
                    } else {
                        return res.status(200).json({ message: "The refferend learners has not been confirmed." })

                    }
                } else {
                    return res.status(200).json({ message: "Referred not Learner could be found." })
                }
            }
        })
    })
})
router.post('/AddlearnerTograde', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT AdmissionNumber FROM learnerandgrade WHERE AdmissionNumber=?"
        connection.query(query, [data.AdmissionNumber], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ message: 'Selected learner already exist' })
                } else {
                    query = "INSERT INTO learnerandgrade(GradeId,DepartmentID,AdmissionNumber,Status) VALUES(?,?,?,?)"
                    connection.query(query, [data.gradeId, data.DepartmentID, data.AdmissionNumber, data.Status], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            return res.status(200).json({ message: 'Request was successful' })
                        }
                    })
                }
            }
        })
    })
})
router.post('/learnerTodrop', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT prosApp.AdmissionNumber,pass.Image," +
            "appBio.applicantSurname,appBio.applicantMiddlename,appBio.applicantLastname " +
            "FROM prospectivelearners prosApp LEFT JOIN passportphotos pass ON prosApp.AdmissionNumber=pass.AdmissionNumber LEFT JOIN applicantbiodata appBio ON prosApp.AdmissionNumber=appBio.AdmissionNumber WHERE prosApp.AdmissionNumber=?"
        connection.query(query, [data.AdmissionNumber], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ data: results[0] })
                } else {
                    res.status(200).json({ message: "The requested learner coujld not be found" })
                }
            }
        })
    })
})
router.post('/droplearneraction', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT  AdmissionNumber FROM learnerandgrade WHERE AdmissionNumber=?"
        connection.query(query, [data.AdmissionNumber], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    query = "DELETE FROM learnerandgrade WHERE AdmissionNumber=?"
                    connection.query(query, [data.AdmissionNumber], (error, results) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            return res.status(200).json({ message: "Request was successful" })
                        }
                    })
                } else {
                    return res.status(200).json({ message: "No account matches the Admission Number entered" })
                }
            }
        })
    })
})
router.post('/newacademicsession', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT sessionID,ac_session FROM academicsession WHERE ac_session=?"
        connection.query(query, [data.academicsession], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ error: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ message: "Session already registered" })
                } else {
                    query = "INSERT INTO academicsession (sessionID,ac_session,Description,SessionStartDate,SessionEndate,DateAssigned)VALUES(?,?,?,?,?,?)"
                    connection.query(query, [data.EntryID, data.academicsession, data.description, data.Startdate, data.Enddate, data.date], (error, results) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({ error: error.sqlMessage })
                        } else {
                            return res.status(200).json({ message: "Request was successful" })
                        }
                    })


                }
            }
        })
    })
})
router.post('/loadacademicsession', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT sn,sessionID,ac_session,Description,SessionStartDate,SessionEndate,DateAssigned FROM academicsession"
        connection.query(query, (error, results) => {
            if (error) {
                console.log(error.sqlMessage)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let data = results

                    query = "SELECT ac_session FROM academicsession"
                    connection.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            let list = results;
                            return res.status(200).json({ data: data, list: list })
                        }

                    })

                } else {
                    return res.status(200).json({ message: "No records found" })
                }
            }
        })
    })
})
router.post("/delSession", (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "DELETE FROM academicsession WHERE ac_session=?"
        connection.query(query, [data.session], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successful" })
            }
        })
    })
})
router.post('/loadSelectedsession', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT ac_session,Description,SessionStartDate,SessionEndate,DateAssigned FROM academicsession WHERE ac_session=?"
        connection.query(query, [data.session], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ result: results[0] })
                } else {
                    return res.status(200).json({ message: "No records found for your query" })
                }
            }
        })
    })
})
router.post('/updatesession', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicsession SET ac_session=? WHERE ac_session=?"
        connection.query(query, [data.newsession, data.oldsession], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successful" })
            }
        })

    })
})




router.post('/updateDates', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicsession SET SessionStartDate=?,SessionEndate=?,Description=? WHERE ac_session=?"
        connection.query(query, [data.Startdate, data.Enddate, data.description, data.session], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successful" })
            }
        })
    })
})
router.post('/searchsession', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT ac_session,Description,SessionStartDate,SessionEndate,DateAssigned FROM academicsession WHERE ac_session=?"
        connection.query(query, [data.selected], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ list: results })
                } else {
                    return res.status(200).json({ message: "No records found for your query" })
                }
            }
        })

    })
})
router.post('/createTerm', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT Tid,TermlyObject,DateCreated FROM academicterms WHERE TermlyObject=? "
        connection.query(query, [data.selectedTerm], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    return res.status(200).json({ message: "The seleted term/semester is already registered" })
                } else {
                    if (data.currentTerm === true) {
                        query = "UPDATE academicterms SET AcademicState=? WHERE AcademicState=?"
                        connection.query(query, ["INACTIVE", data.currentState], (error, results) => {
                            if (error) {
                                res.status(500).json({ message: error.sqlMessage })
                            } else {
                                query = "INSERT INTO academicterms(Tid,TermlyObject,Status,DateCreated,AcademicState)VALUES(?,?,?,?,?)"
                                connection.query(query, [data.trmID, data.selectedTerm, data.Status, data.date, data.currentState], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        return res.status(500).json({ message: error.sqlMessage })
                                    } else {
                                        return res.status(200).json({ message: "Request was successful" })
                                    }
                                })
                            }
                        })

                    } else {
                        query = "INSERT INTO academicterms(Tid,TermlyObject,Status,DateCreated,AcademicState)VALUES(?,?,?,?,?)"
                        connection.query(query, [data.trmID, data.selectedTerm, data.Status, data.date, data.currentState], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                return res.status(200).json({ message: "Request was successful" })
                            }
                        })
                    }
                }
            }
        })
    })
})




router.post('/listTerms', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT Tid,TermlyObject,Status,AcademicState,DateCreated FROM academicterms"
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {

                    return res.status(200).json({ data: results })
                } else {
                    return res.status(200).json({ message: "No records available" })
                }
            }
        })
    })
})
router.post('/updateTerm', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "UPDATE academicterms SET Status=?,AcademicState=?"
        connection.query(query, ['false', 'INACTIVE'], (error, results) => {
            if (error) {
                console.log(error.sqlMessage)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                query = "UPDATE academicterms SET Status=?,AcademicState=? WHERE TermlyObject=?"
                connection.query(query, [data.isChecked, data.currentState, data.selectedValue], (error, results) => {
                    if (error) {
                        console.log(error.sqlMessage)
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        return res.status(200).json({ message: "Request was successful" })
                    }
                })
            }
        })
        // console.log(data)
    })
})

router.post('/newWeek', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT WeekDescription FROM AcademicWeeksList WHERE WeekDescription=?"
        connection.query(query, [data.newWeek], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ message: "Week already exist" })
                } else {
                    query = "INSERT INTO AcademicWeeksList(WeekID,WeekDescription)VALUES(?,?)"
                    connection.query(query, [data.weekID, data.newWeek], (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            return res.status(200).json({ message: "Request was successful" })
                        }
                    })
                }
            }
        })
    })
})

router.post('/getweeks', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT SN,WeekID,WeekDescription FROM academicweekslist "
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    console.log(results)
                    return res.status(200).json({ results: results })
                } else {
                    res.status(200).json({ message: "No records available" })
                }
            }
        })
    })
})

router.post('/delweek', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers

        query = "DELETE FROM academicweekslist WHERE SN=?"
        connection.query(query, [data.sn], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                return res.status(200).json({ message: "Request was successfully executed" })
            }
        })
    })
})

router.post('/loadacademicDetails', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT WeekID,WeekDescription FROM academicweekslist"
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let weeks = results
                    query = "SELECT Tid,TermlyObject FROM academicterms"

                    connection.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                let terms = results
                                query = "SELECT sessionID,ac_session FROM academicsession"
                                connection.query(query, (error, results) => {
                                    if (error) {
                                        return res.status(500).json({ message: error.sqlMessage })
                                    } else {
                                        if (results.length > 0) {
                                            let session = results
                                            return res.status(200).json({ week: weeks, term: terms, session: session })
                                        } else {
                                            return res.status(200).json({ message: "Academics are not yet registered" })
                                        }
                                    }
                                })
                            } else {
                                return res.status(200).json({ message: "Academic Terms/Semesters are not registered yet" })
                            }
                        }
                    })
                } else {
                    return res.status(200).json({ message: "No Academic Weeks have been created" })
                }
            }
        })
    })
})
router.post('/openTerm', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        if (data.isCurrent === true) {

            query = "UPDATE termbegins SET isCurrent=? WHERE isCurrent=? "
            connection.query(query, ['Closed', '1'], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json({ message: error.sqlMessage })
                } else {
                    query = "INSERT INTO termbegins(RegNumber,WeekOpened,OpenedTerm,AcademicYear,DaysinTerm,WeeksinTerm,TermBegins,TermEnds,dateOpened,OpenedBy,isCurrent)VALUES(?,?,?,?,?,?,?,?,?,?,?)"
                    connection.query(query, [data.entryID, data.week, data.term, data.year, data.toalDays, data.totalWeeks, data.termbegins, data.termEnds, data.date, data.user, data.isCurrent], (error, results) => {
                        if (error) {
                            return res.status(200).json({ message: error.sqlMessage })
                        } else {
                            return res.status(200).json({ message: "Register successfully opened" })
                        }
                    })
                }
            })
        } else {
            query = "INSERT INTO termbegins(RegNumber,WeekOpened,OpenedTerm,AcademicYear,DaysinTerm,WeeksinTerm,TermBegins,TermEnds,dateOpened,OpenedBy,isCurrent)VALUES(?,?,?,?,?,?,?,?,?,?,?)"
            connection.query(query, [data.entryID, data.week, data.term, data.year, data.toalDays, data.totalWeeks, data.termbegins, data.termEnds, data.date, data.user, data.isCurrent], (error, results) => {
                if (error) {
                    return res.status(200).json({ message: error.sqlMessage })
                } else {
                    return res.status(200).json({ message: "Register successfully opened" })
                }
            })
        }
    })
})
router.post('/startRegister', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT user.StaffID,user.role,user.status,user.FullName,facilitators.AssignedDepartment,facilitators.AssignedGrade,academicgrades.GradeDescription, academicdepartment.DeptName FROM user LEFT JOIN facilitators ON user.StaffID=facilitators.StaffId LEFT JOIN academicgrades ON facilitators.AssignedGrade=academicgrades.SerialNumber LEFT JOIN academicdepartment ON facilitators.AssignedDepartment=academicdepartment.DeptId  WHERE user.StaffID=? AND facilitators.Status=?"
        connection.query(query, [data.staffId, 'Current'], (error, results) => {
            if (error) {
                console.log(error)
                res.status(500).json({ message: error?.sqlMessage })
            } else {
                if (results.length > 0) {
                    let authorised = results[0].status
                    let role = results[0].role
                    let rs = results
                    query = 'SELECT termbegins.OpenedTerm, termbegins.AcademicYear,academicterms.TermlyObject,academicterms.AcademicState,academicsession.ac_session FROM termbegins LEFT JOIN academicterms ON termbegins.OpenedTerm=academicterms.Tid LEFT JOIN academicsession ON termbegins.AcademicYear=academicsession.sessionID WHERE termbegins.isCurrent=? AND academicterms.AcademicState=?'
                    connection.query(query, [1, 'CURRENT'], (error, results) => {
                        if (error) {
                            console.log(error)
                            res.status(500).json({ message: error?.sqlMessage })
                        } else {
                            console.log("Result", results)
                            if (results.length > 0) {
                                let data = results
                                if (authorised === 'true') {
                                    if (role === process.env.FACILITATOR) {
                                        console.log("Results", rs)

                                        return res.status(200).json({ USER_FOUND: rs, data: data })
                                    } else {
                                        if (role === process.env.HEADMASTER) {
                                            return res.status(200).json({ USER_FOUND: rs, data: data })
                                        } else {
                                            if (role === process.env.ADMINISTRATOR) {
                                                return res.status(200).json({ USER_FOUND: rs, data: data })
                                            } else {
                                                res.status(500).json({ message: "Sorry you have no access to this module" })
                                            }
                                        }
                                    }
                                } else {
                                    res.status(500).json({ message: "Sorry you are not authorised to access this module" })
                                }
                            } else {
                                res.status(200).json({ message: 'Unknown error occured' })
                            }
                        }
                    })
                } else {
                    res.status(500).json({ message: "Invalid staff Id. Check and try again" })
                }
            }
        })
    })
})

router.post('/loadActiveWeeks', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT WeekID,WeekDescription FROM academicweekslist"
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(200).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ DATA_FOUND: results })
                } else {
                    return res.status(200).json({ message: "Please contact Admin to generate weeks" })
                }
            }
        })
    })
})

router.post('/saveWeek', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID FROM weekly_attendance WHERE  GradeID=? AND DepartmentID=? AND AcdemicYear=? AND TermID=? AND WeekID=? AND isClosed=?"
        connection.query(query, [data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, data.weekID, false], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error })
            } else {
                if (results.length > 0) {
                    return res.status(200).json({ message: "Week you are creating has already been created for this term" })
                } else {

                    query = "SELECT * FROM weekly_attendance WHERE  GradeID=? AND DepartmentID=? AND AcdemicYear=? AND TermID=?"
                    connection.query(query, [data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID], (error, results) => {
                        if (error) {
                            return res.status(500).json({ message: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                let status = results[0].isClosed
                                if (status === 1) {
                                    query = "INSERT INTO weekly_attendance(weeklyattendanceID,GradeID,DepartmentID,AcdemicYear,TermID,WeekID,isClosed,Verified)VALUES(?,?,?,?,?,?,?,?)"
                                    connection.query(query, [data.attendanceID, data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, data.weekID, false, false], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(500).json({ message: error })
                                        } else {
                                            query = "SELECT weekly_attendance.weeklyattendanceID,weekly_attendance.WeekID,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,learnerandgrade.AdmissionNumber,academicweekslist.WeekDescription FROM weekly_attendance LEFT JOIN learnerandgrade ON weekly_attendance.GradeID=learnerandgrade.GradeId LEFT JOIN applicantbiodata ON learnerandgrade.AdmissionNumber=applicantbiodata.AdmissionNumber LEFT JOIN academicweekslist ON academicweekslist.WeekID=weekly_attendance.WeekID WHERE weekly_attendance.weeklyattendanceID=? AND weekly_attendance.GradeID=? AND weekly_attendance.DepartmentID=? AND AcdemicYear=? AND weekly_attendance.TermID=? AND weekly_attendance.WeekID=? AND weekly_attendance.isClosed=?"
                                            connection.query(query, [data.attendanceID, data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, data.weekID, false], (error, results) => {
                                                if (error) {
                                                    console.log(error)
                                                    return res.status(500).json({ message: error.sqlMessage })

                                                } else {
                                                    if (results.length > 0) {

                                                        console.log(results)
                                                        return res.status(200).json({ RECORD_FOUND: results })
                                                    } else {
                                                        console.log('not found')
                                                        return res.status(500).json({ message: "No records found" })

                                                    }

                                                }
                                            })

                                        }
                                    })
                                } else {
                                    return res.status(200).json({ message: "An active activity is already in session. Close this activity before creating a new session" })
                                }
                            } else {
                                query = "INSERT INTO weekly_attendance(weeklyattendanceID,GradeID,DepartmentID,AcdemicYear,TermID,WeekID,isClosed,Verified)VALUES(?,?,?,?,?,?,?,?)"
                                connection.query(query, [data.attendanceID, data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, data.weekID, false, false], (error, results) => {
                                    if (error) {
                                        console.log(error)
                                        return res.status(500).json({ message: error })
                                    } else {
                                        query = "SELECT weekly_attendance.weeklyattendanceID,weekly_attendance.WeekID,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,learnerandgrade.AdmissionNumber,academicweekslist.WeekDescription FROM weekly_attendance LEFT JOIN learnerandgrade ON weekly_attendance.GradeID=learnerandgrade.GradeId LEFT JOIN applicantbiodata ON learnerandgrade.AdmissionNumber=applicantbiodata.AdmissionNumber LEFT JOIN academicweekslist ON academicweekslist.WeekID=weekly_attendance.WeekID WHERE weekly_attendance.weeklyattendanceID=? AND weekly_attendance.GradeID=? AND weekly_attendance.DepartmentID=? AND AcdemicYear=? AND weekly_attendance.TermID=? AND weekly_attendance.WeekID=? AND weekly_attendance.isClosed=?"
                                        connection.query(query, [data.attendanceID, data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, data.weekID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })

                                            } else {
                                                if (results.length > 0) {

                                                    console.log(results)
                                                    return res.status(200).json({ RECORD_FOUND: results })
                                                } else {
                                                    console.log('not found')
                                                    return res.status(500).json({ message: "No records found" })

                                                }

                                            }
                                        })

                                    }
                                })
                            }
                        }
                    })




                }
            }
        })
    })
})

router.post('/activity', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,WeekID,Verified,isClosed FROM weekly_attendance WHERE GradeID=? AND DepartmentID=? AND AcdemicYear=? AND TermID=? AND isClosed=?"
        connection.query(query, [data.AssignedGrade, data.DeptID, data.AcademicYear, data.TermID, false], (error, results) => {
            if (error) {

                return res.status(500).json({ message: error.sqlMessage })
            } else {

                if (results.length > 0) {
                    let activityID = results[0].weeklyattendanceID
                    let week = results[0].WeekID
                    let status = results[0].isClosed
                    if (status === true) {
                        return res.status(200).json({ message: "This activity is closed. Contact Admin" })
                    } else {

                        query = "SELECT applicantbiodata.AdmissionNumber, applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,weekly_attendance.GradeID,academicgrades.GradeDescription,academicterms.TermlyObject,weekly_attendance.TermID,weekly_attendance.WeekID,academicweekslist.WeekDescription,weekly_attendance.weeklyattendanceID,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday FROM weekly_attendance LEFT JOIN  academicweekslist ON weekly_attendance.WeekID=academicweekslist.WeekID LEFT JOIN academicterms ON weekly_attendance.TermID=academicterms.Tid LEFT JOIN academicgrades ON weekly_attendance.GradeID=academicgrades.SerialNumber LEFT JOIN learnerandgrade ON weekly_attendance.GradeID=learnerandgrade.GradeId LEFT JOIN applicantbiodata ON learnerandgrade.AdmissionNumber=applicantbiodata.AdmissionNumber LEFT JOIN attendance ON weekly_attendance.weeklyattendanceID=attendance.weeklyattendanceID  WHERE weekly_attendance.weeklyattendanceID=?"
                        connection.query(query, [activityID], (error, results) => {
                            if (error) {
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                if (results.length > 0) {

                      
                                    for (let i = 0; i < results.length; i++) {
                                         
                                        if (results[i].Monday === null) {
                                            results[i].Monday = 'false'
                                         
                                        }
                                        if (results[i].Tuesday === null) {
                                            results[i].Tuesday = 'false'
                                        }
                                        if (results[i].Wednesday === null) {
                                            results[i].Wednesday = 'false'
                                        }
                                        if (results[i].Thursday === null) {
                                            results[i].Thursday = 'false'
                                        }
                                        if (results[i].Friday === null) {
                                            results[i].Friday = 'false'

                                        }

                                    }      
                                       console.log("term IDsss",  results)   

                                    return res.status(200).json({ DATA_FOUND: results })
                                } else {
                                    query = "SELECT applicantbiodata.AdmissionNumber, applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,weekly_attendance.GradeID,academicgrades.GradeDescription,academicterms.TermlyObject,weekly_attendance.TermID,weekly_attendance.WeekID,academicweekslist.WeekDescription,weekly_attendance.weeklyattendanceID FROM weekly_attendance LEFT JOIN  academicweekslist ON weekly_attendance.WeekID=academicweekslist.WeekID LEFT JOIN academicterms ON weekly_attendance.TermID=academicterms.Tid LEFT JOIN academicgrades ON weekly_attendance.GradeID=academicgrades.SerialNumber LEFT JOIN learnerandgrade ON weekly_attendance.GradeID=learnerandgrade.GradeId LEFT JOIN applicantbiodata ON learnerandgrade.AdmissionNumber=applicantbiodata.AdmissionNumber WHERE weekly_attendance.weeklyattendanceID=?"
                                    connection.query(query, [activityID], (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            res.status(500).json({ message: error.sqlMessage })
                                        } else {

                                            if (results.length > 0) {
                                      
                                                return res.status(200).json({ NEW_ACTIVITY: results })
                                            } else {
                                                res.status(500).json({ message: "Learners have not been assigned to this grade. Contact Admin" })
                                            }
                                        }
                                    })
                                }
                            }
                        })

                    }
                } else {
                    console.log("No No Activity")
                    return res.status(200).json({ message: "No have no current activity. Generate a week and continue" })
                }
            }
        })
    })
})
router.post('/monday', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,isClosed FROM attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activitID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let status = results[0].isClosed
                    if (status === 1) {
                        console.log('closed')
                        return res.status(200).json({ message: "Attendance is aready closed for this week" })
                    } else {
                        query = "UPDATE attendance SET Monday=? WHERE weeklyattendanceID=? AND AdmissionNumber=?"
                        connection.query(query, [data.selection, data.activitID, data.learnerID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                console.log("Selected Option", results)
                                if (results.affectedRows > 0) {

                                    var total;

                                    if (data.selection === "true") {

                                        query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                        connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })
                                            } else {
                                                console.log("no affected rows")
                                                total = results[0].TotalAttendance
                                                total = total + 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })
                                                    }
                                                })


                                            }
                                        })



                                    } else {
                                        if (data.selection === "false") {

                                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {

                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })

                                                    }
                                                })

                                            })
                                        } else {
                                            console.log("No data")
                                            return res.status(200).json({ message: "Invalid Attendace value" })
                                        }

                                    }







                                } else {

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO attendance(weeklyattendanceID,AdmissionNumber,Monday) VALUES(?,?,?)"
                    connection.query(query, [data.activitID, data.learnerID, data.selection], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                console.log("checking-----", data)
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log("Data: ", data.selection)
                                    if (results.length > 0) {
                                        var total;

                                        if (data.selection === "true") {
                                            total = results[0].TotalAttendance
                                            total = total + 1
                                            query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                if (error) {

                                                    return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                } else {
                                                    //
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        //load refresh data
                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ message: "Invalid Attendace value" })
                                            }

                                        }
                                    } else {

                                        var total;
                                        if (data.selection === "true") {
                                            total = 1
                                            query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                            connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                if (error) {
                                                    return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                } else {
                                                    //Load and refresh data
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = 0
                                                query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                                connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                    } else {
                                                        //Load and refresh data
                                                    }
                                                })
                                            }
                                        }

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})

router.post('/tuesday', (req, res) => {

    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,isClosed FROM attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activitID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let status = results[0].isClosed
                    if (status === 1) {
                        console.log('closed')
                        return res.status(200).json({ message: "Attendance is aready closed for this week" })
                    } else {
                        query = "UPDATE attendance SET Tuesday=? WHERE weeklyattendanceID=? AND AdmissionNumber=?"
                        connection.query(query, [data.selection, data.activitID, data.learnerID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                console.log("Selected Option", results)
                                if (results.affectedRows > 0) {

                                    var total;

                                    if (data.selection === "true") {

                                        query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                        connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })
                                            } else {
                                                console.log("no affected rows")
                                                total = results[0].TotalAttendance
                                                total = total + 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, "false"], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })
                                                    }
                                                })


                                            }
                                        })



                                    } else {
                                        if (data.selection === "false") {

                                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {

                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })

                                                    }
                                                })

                                            })
                                        } else {
                                            console.log("No data")
                                            return res.status(200).json({ message: "Invalid Attendace value" })
                                        }

                                    }







                                } else {

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO attendance(weeklyattendanceID,AdmissionNumber,Tuesday) VALUES(?,?,?)"
                    connection.query(query, [data.activitID, data.learnerID, data.selection], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                console.log("checking-----", data)
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log("Data: ", data.selection)
                                    if (results.length > 0) {
                                        var total;

                                        if (data.selection === "true") {
                                            total = results[0].TotalAttendance
                                            total = total + 1
                                            query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                if (error) {

                                                    return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                } else {
                                                    //
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        //load refresh data
                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ message: "Invalid Attendace value" })
                                            }

                                        }
                                    } else {

                                        var total;
                                        if (data.selection === "true") {
                                            total = 1
                                            query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                            connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                if (error) {
                                                    return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                } else {
                                                    //Load and refresh data
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = 0
                                                query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                                connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                    } else {
                                                        //Load and refresh data
                                                    }
                                                })
                                            }
                                        }

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})

router.post('/wednesday', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,isClosed FROM attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activitID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let status = results[0].isClosed
                    if (status === 1) {
                        console.log('closed')
                        return res.status(200).json({ message: "Attendance is aready closed for this week" })
                    } else {
                        query = "UPDATE attendance SET Wednesday=? WHERE weeklyattendanceID=? AND AdmissionNumber=?"
                        connection.query(query, [data.selection, data.activitID, data.learnerID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                console.log("Selected Option", results)
                                if (results.affectedRows > 0) {

                                    var total;

                                    if (data.selection === "true") {

                                        query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                        connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })
                                            } else {
                                                console.log("no affected rows")
                                                total = results[0].TotalAttendance
                                                total = total + 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, "false"], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })
                                                    }
                                                })


                                            }
                                        })



                                    } else {
                                        if (data.selection === "false") {

                                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {

                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })

                                                    }
                                                })

                                            })
                                        } else {
                                            console.log("No data")
                                            return res.status(200).json({ message: "Invalid Attendace value" })
                                        }

                                    }







                                } else {

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO attendance(weeklyattendanceID,AdmissionNumber,Wednesday) VALUES(?,?,?)"
                    connection.query(query, [data.activitID, data.learnerID, data.selection], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                console.log("checking-----", data)
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log("Data: ", data.selection)
                                    if (results.length > 0) {
                                        var total;

                                        if (data.selection === "true") {
                                            total = results[0].TotalAttendance
                                            total = total + 1
                                            query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                if (error) {

                                                    return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                } else {
                                                    //
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        //load refresh data
                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ message: "Invalid Attendace value" })
                                            }

                                        }
                                    } else {

                                        var total;
                                        if (data.selection === "true") {
                                            total = 1
                                            query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                            connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                if (error) {
                                                    return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                } else {
                                                    //Load and refresh data
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = 0
                                                query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                                connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                    } else {
                                                        //Load and refresh data
                                                    }
                                                })
                                            }
                                        }

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})
router.post('/Thursday', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,isClosed FROM attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activitID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let status = results[0].isClosed
                    if (status === 1) {
                        console.log('closed')
                        return res.status(200).json({ message: "Attendance is aready closed for this week" })
                    } else {
                        query = "UPDATE attendance SET Thursday=? WHERE weeklyattendanceID=? AND AdmissionNumber=?"
                        connection.query(query, [data.selection, data.activitID, data.learnerID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                console.log("Selected Option", results)
                                if (results.affectedRows > 0) {

                                    var total;

                                    if (data.selection === "true") {

                                        query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                        connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })
                                            } else {
                                                console.log("no affected rows")
                                                total = results[0].TotalAttendance
                                                total = total + 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })
                                                    }
                                                })


                                            }
                                        })



                                    } else {
                                        if (data.selection === "false") {

                                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {

                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })

                                                    }
                                                })

                                            })
                                        } else {
                                            console.log("No data")
                                            return res.status(200).json({ message: "Invalid Attendace value" })
                                        }

                                    }







                                } else {

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO attendance(weeklyattendanceID,AdmissionNumber,Thursday) VALUES(?,?,?)"
                    connection.query(query, [data.activitID, data.learnerID, data.selection], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                console.log("checking-----", data)
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log("Data: ", data.selection)
                                    if (results.length > 0) {
                                        var total;

                                        if (data.selection === "true") {
                                            total = results[0].TotalAttendance
                                            total = total + 1
                                            query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                if (error) {

                                                    return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                } else {
                                                    //
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        //load refresh data
                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ message: "Invalid Attendace value" })
                                            }

                                        }
                                    } else {

                                        var total;
                                        if (data.selection === "true") {
                                            total = 1
                                            query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                            connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                if (error) {
                                                    return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                } else {
                                                    //Load and refresh data
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = 0
                                                query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                                connection.query(query, [data.activitID, data.learnerID, total, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                    } else {
                                                        //Load and refresh data
                                                    }
                                                })
                                            }
                                        }

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})
router.post('/friday', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT weeklyattendanceID,isClosed FROM attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activitID], (error, results) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let status = results[0].isClosed
                    if (status === 1) {
                        console.log('closed')
                        return res.status(200).json({ message: "Attendance is aready closed for this week" })
                    } else {
                        query = "UPDATE attendance SET Friday=? WHERE weeklyattendanceID=? AND AdmissionNumber=?"
                        connection.query(query, [data.selection, data.activitID, data.learnerID], (error, results) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                console.log("Selected Option", results)
                                if (results.affectedRows > 0) {

                                    var total;

                                    if (data.selection === "true") {

                                        query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                        connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                return res.status(500).json({ message: error.sqlMessage })
                                            } else {
                                                console.log("no affected rows")
                                                total = results[0].TotalAttendance
                                                total = total + 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })
                                                    }
                                                })


                                            }
                                        })



                                    } else {
                                        if (data.selection === "false") {

                                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [data.activitID, data.learnerID, false], (error, results) => {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, false], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {

                                                        query = "SELECT attendance.weeklyattendanceID,attendance.AdmissionNumber,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname FROM attendance LEFT JOIN applicantbiodata ON attendance.AdmissionNumber=applicantbiodata.AdmissionNumber  WHERE attendance.weeklyattendanceID=?"
                                                        connection.query(query, [data.activitID], (error, results) => {
                                                            if (error) {
                                                                res.status(500).json({ message: error.sqlMessage })
                                                            } else {
                                                                if (results.length > 0) {
                                                                    console.log(results)
                                                                    return res.status(200).json({ DATA_FOUND: results })
                                                                } else {
                                                                    return res.status(200).json({ message: "No results" })
                                                                }
                                                            }
                                                        })

                                                    }
                                                })

                                            })
                                        } else {
                                            console.log("No data")
                                            return res.status(200).json({ message: "Invalid Attendace value" })
                                        }

                                    }

                                } else {

                                }
                            }
                        })
                    }
                } else {
                    query = "INSERT INTO attendance(weeklyattendanceID,AdmissionNumber,Friday) VALUES(?,?,?)"
                    connection.query(query, [data.activitID, data.learnerID, data.selection], (error, results) => {
                        if (error) {

                            return res.status(500).json({ message: error.sqlMessage })
                        } else {

                            query = "SELECT TotalAttendance FROM weekly_attn_statistics  WHERE activityID=? AND AdmissionNumber=? AND isClosed=?"
                            connection.query(query, [data.activitID, data.learnerID, "false"], (error, results) => {
                                console.log("checking-----", data)
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log("Data: ", data.selection)
                                    if (results.length > 0) {
                                        var total;

                                        if (data.selection === "true") {
                                            total = results[0].TotalAttendance
                                            total = total + 1
                                            query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                            connection.query(query, [total, data.activitID, data.learnerID, 'false'], (error, results) => {
                                                if (error) {

                                                    return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                } else {
                                                    //
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = results[0].TotalAttendance
                                                total = total - 1
                                                query = "UPDATE weekly_attn_statistics SET TotalAttendance=? WHERE  activityID=? AND AdmissionNumber=? AND isClosed=?"
                                                connection.query(query, [total, data.activitID, data.learnerID, 'false'], (error, results) => {
                                                    if (error) {
                                                        console.log(error)
                                                        return res.status(200).json({ message: "Error updating attendance statistics. Try again" })
                                                    } else {
                                                        //load refresh data
                                                    }
                                                })
                                            } else {
                                                return res.status(200).json({ message: "Invalid Attendace value" })
                                            }

                                        }
                                    } else {

                                        var total;
                                        if (data.selection === "true") {
                                            total = 1
                                            query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                            connection.query(query, [data.activitID, data.learnerID, total, 'false'], (error, results) => {
                                                if (error) {
                                                    return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                } else {
                                                    //Load and refresh data
                                                }
                                            })
                                        } else {
                                            if (data.selection === "false") {
                                                total = 0
                                                query = "INSERT INTO weekly_attn_statistics(activityID,AdmissionNumber,TotalAttendance,isClosed) VALUES(?,?,?,?)"
                                                connection.query(query, [data.activitID, data.learnerID, total, 'false'], (error, results) => {
                                                    if (error) {
                                                        return res.status(200).json({ message: "Error adding attendance statistics. Try again" })
                                                    } else {
                                                        //Load and refresh data
                                                    }
                                                })
                                            }
                                        }

                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})
router.post('/closeweek', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = "SELECT isClosed FROM weekly_attendance WHERE weeklyattendanceID=?"
        connection.query(query, [data.activityID], (error, result) => {
            if (error) {
                return res.status(500).json({ message: error.sqlMessage })
            } else {
                if (result.length > 0) {
                    let e = result[0].isClosed
                    if (e === 1) {
                        res.status(200).json({ message: "The was unsuccessful. The week is already closed" })
                    } else {
                        query = "UPDATE weekly_attendance SET isClosed=? WHERE weeklyattendanceID=?"
                        connection.query(query, [true, data.activityID], (error, results) => {
                            if (error) {
                                return res.status(500).json({ message: error.sqlMessage })
                            } else {
                                return res.status(200).json({ SUCCESS: "Operation was successful" })
                            }
                        })
                    }
                } else {
                    return res.status(200).json({ message: "Records not found" })
                }
            }
        })
    })
})
router.post('/getlearner', (req, res) => {
    let data = req.body
    console.log(data)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }
        let data = req.body
        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        query = 'SELECT applicantbiodata.AdmissionNumber,applicantbiodata.applicantSurname,applicantMiddlename,applicantbiodata.applicantLastname,passportphotos.Image FROM applicantbiodata LEFT JOIN passportphotos ON applicantbiodata.AdmissionNumber=passportphotos.AdmissionNumber WHERE applicantbiodata.AdmissionNumber=?'
        connection.query(query, [data.learnerID], (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ error: error.sqlMessage })
            } else {
                if (results.length > 0) {
                    let rs = results
                    query = "SELECT attendance.weeklyattendanceID,weekly_attendance.AcdemicYear,weekly_attendance.TermID,weekly_attendance.WeekID, academicterms.TermlyObject,academicsession.ac_session,academicweekslist.WeekDescription,attendance.Monday,attendance.Tuesday,attendance.Wednesday,attendance.Thursday,attendance.Friday FROM weekly_attendance LEFT JOIN academicterms ON weekly_attendance.TermID=academicterms.Tid LEFT JOIN  academicsession ON weekly_attendance.AcdemicYear=academicsession.sessionID LEFT JOIN academicweekslist ON weekly_attendance.WeekID=academicweekslist.WeekID LEFT JOIN attendance ON weekly_attendance.weeklyattendanceID=attendance.weeklyattendanceID WHERE attendance.AdmissionNumber=? "
                    connection.query(query, [data.learnerID], (error, results) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({ error: error.sqlMessage })
                        } else {
                            if (results.length > 0) {
                                return res.status(200).json({ header: rs, records: results })
                            } else {
                                return res.status(200).json({ error: "No attendance records found for the selected learner" })
                            }
                        }
                    })
                } else {
                    return res.status(200).json({ error: "Invalid Admission Number" })
                }
            }
        })
    })
})
router.post('/dropAttn', (req, res) => {
    let data = req.body
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return;
        }

        res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a specific origin
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
        let data = req.body
        console.log(data)

    })
})
module.exports = router;