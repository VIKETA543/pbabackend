const express = require("express");
const connection = require('../connection');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const router = express.Router();
var auth = require('../services/authentication')
const checkRole = require("../services/checkRole");
const pool = require('../connection');
const multer = require('multer');

router.post('/applicationAuth', (req, res) => {
    let data = req.body
    console.log(data)
    query = "SELECT SerialNumber,SerialPin,SerialStatus,Authority FROM applicationserial WHERE SerialNumber=?"
    connection.query(query, [data.serialNumber], (error, results) => {
        if (error) {
            return res.status(500).json(error.sqlMessage)
        } else {
            let rs = results[0];
            if(results.length>0){
            console.log('testing', rs)
            if (rs.serialnumber === data.serialNumber && rs.SerialPin === data.pinNumber && rs.SerialStatus === "SOLD") {
                query = 'SELECT SerialStatus, ProcessStage FROM salesofapplicationserial WHERE SerialNumber=?'
                connection.query(query, [data.serialNumber], (error, result) => {
                    if (!error) {
                        if (result.length > 0) {
                            console.log(result[0])
                            return res.status(200).json({ progress: result[0].ProcessStage, processstatus: result[0].SerialStatus, message: "Login successful" })
                        } else {
                            return res.status(401).json({ message: "An error occured. Could not fetch progress details" })
                        }
                    } else {
                        return res.status(500).json({ message: error.sqlMessage })
                    }
                })

            } else {
                return res.status(500).json({ message: 'Check your login details.' })
            }
    }else{
        return res.status(201).json({ message: "The Serial Number and pin does not exist" }) 
    }
    }
    })
})


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/passportPhotos', upload.single('image'), (req, res) => {


    const data = req.body; // Get image buffer 
    const img = req.file.buffer

    query = 'SELECT SerialNumber,Image FROM passportPhotos WHERE SerialNumber=?'
    connection.query(query, [data.applicationNumber], (error, results) => {

        if (error) {
            res.status(500).json({ message: error.sqlMessage });
        } else {
            if (results <= 0) {

                query = 'INSERT INTO passportPhotos(SerialNumber,Image) VALUES (?,?)';

                connection.query(query, [data.applicationNumber, img], (err, result) => {
                    if (err) {

                        res.status(500).json({ message: err.sqlMessage });
                    } else {
                        query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber'
                        connection.query(query, [data.progress, applicationNumber], (err, result) => {
                            if (err) {
                                res.status(500).json({ message: err.sqlMessage });
                            } else {

                                res.status(200).json({ message: 'Image uploaded and stored in DB!' });
                            }
                        })
                    }
                });
            } else {
                query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
                connection.query(query, [data.applicationNumber], (error, results) => {
                    if (error) {
                        res.status(500).json({ message: error.sqlMessage });
                    } else {
                        console.log(results)
                        if (results.length >= 0) {

                            query = "UPDATE passportPhotos SET Image=?  WHERE SerialNumber=?"
                            connection.query(query, [img, data.applicationNumber], (error, results) => {
                                if (error) {

                                    res.status(500).json({ message: error.sqlMessage });
                                } else {
                                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                        if (err) {
                                            res.status(500).json({ message: err.sqlMessage });
                                        } else {

                                            res.status(200).json({ message: 'Image uploaded and stored in DB!' });
                                        }
                                    })
                                }

                            })
                        } else {
                            res.status(500).json({ message: error.sqlMessage });
                        }
                    }
                })
            }
        }

    });
})
router.post('/loadPassportPicture', ((req, res) => {
    const id = req.body
    query = "SELECT SerialNumber,Image FROM passportPhotos WHERE SerialNumber=?"
    connection.query(query, [id.serialNumber], (error, results) => {
        if (error) {
            res.status(401).json({ message: error.sqlMessage })
        } else {
            var buffer = Buffer(results[0].Image);
            var BufferedBase64 = buffer.toString('base64')

            return res.status(200).json({ image: BufferedBase64 })

        }

    })
}))
                    
router.post('/ApplicantBioData', (req, res) => {

    let biodata = req.body;
    query = 'SELECT applicationNumber,applicantSurname,applicantMiddlename,applicantLastname,applicantNationality,applicantAddress,applicantGender,applicantDateofBirth,applicantAge,NumberofMaleSiblings,NumberofFemaleSiblings FROM applicantbiodata WHERE applicationNumber=?'
    connection.query(query, [biodata.applicationNumber], (error, results) => {
        if (results.length <= 0) {
            query = 'INSERT INTO applicantbiodata (applicationNumber,applicantSurname,applicantMiddlename,applicantLastname,applicantNationality,applicantAddress,applicantGender,applicantDateofBirth,applicantAge,NumberofMaleSiblings,NumberofFemaleSiblings) VALUES(?,?,?,?,?,?,?,?,?,?,?)'
            connection.query(query, [biodata.applicationNumber, biodata.applicantSurname, biodata.applicantMiddlename, biodata.applicantLastname, biodata.applicantNationality, biodata.applicantAddress, biodata.applicantGender, biodata.applicantDateofBirth, biodata.applicantAge, biodata.applicantNumberofMaleSibblings, biodata.applicantNumberofFemaleSibbling], (error, results) => {
                //  console.log(req.body)
                if (!error) {

                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                    connection.query(query, [biodata.progress, biodata.applicationNumber], (err, result) => {
                        if (err) {
                            res.status(500).json({ message: err.sqlMessage });
                        } else {

                            res.status(200).json({ message: 'Account successfully updated' });
                        }
                    })
                } else {
                    console.log(error)
                    return res.status(500).json(error)
                }
            })
        } else {
            query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
            connection.query(query, [biodata.applicationNumber], (error, results) => {
                if (!error) {
                    console.log(biodata)
                    if (results.length > 0) {
                        if (results[0].SerialStatus === 'PROCESSING') {
                            query = 'UPDATE applicantbiodata SET applicantSurname=?,applicantMiddlename=?,applicantLastname=?,applicantNationality=?,applicantAddress=?,applicantGender=?,applicantDateofBirth=?,applicantAge=?,NumberofMaleSiblings=?,NumberofFemaleSiblings=? WHERE applicationNumber=?'
                            connection.query(query, [biodata.applicantSurname, biodata.applicantMiddlename, biodata.applicantLastname, biodata.applicantNationality, biodata.applicantAddress, biodata.applicantGender, biodata.applicantDateofBirth, biodata.applicantAge, biodata.applicantNumberofMaleSibblings, biodata.applicantNumberofFemaleSibbling, biodata.applicationNumber], (error, results) => {
                                if (!error) {

                                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                    connection.query(query, [biodata.progress, biodata.applicationNumber], (err, result) => {
                                        if (err) {
                                            res.status(500).json({ message: err.sqlMessage });
                                        } else {

                                            res.status(200).json({ message: 'Account successfully updated' });
                                        }
                                    })

                                } else {
                                    console.log(error)
                                    return res.status(500).json({ message: error.sqlMessage })
                                }
                            })


                        } else {
                            return res.status(200).json({ message: 'Application process already completed' })
                        }


                    } else {

                        return res.status(500).json({ message: 'Invalid application number' })
                    }
                } else {

                    return res.status(500).json({ message: error.sqlMessage })
                }
            })


        }
    });
})
router.post('/fathersData', (req, res) => {
    console.log(req.body)
    let data = req.body;
    query = "SELECT SerialNumber,fathersName,fathersOccupation,fathersPlaceofWork,fatherMobileNumber,fatherSecondaryNumber,fathersAddress,fathersEmailAdress,relationship,fatherNationality,fathersEducation,isFatherAlive FROM ApplicantfathersDetails WHERE SerialNumber=? "
    connection.query(query, [data.applicationNumber], (error, results) => {
        if (results.length <= 0) {
            query = 'INSERT INTO ApplicantfathersDetails(SerialNumber,fathersName,fathersOccupation,fathersPlaceofWork,fatherMobileNumber,fatherSecondaryNumber,fathersAddress,fathersEmailAdress,relationship,fatherNationality,fathersEducation,isFatherAlive) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
            connection.query(query, [data.applicationNumber, data.fathersName, data.fathersOccupation, data.fathersPlaceofWork, data.fatherMobileNumber, data.fatherSecondaryNumber, data.fathersAddress, data.fathersEmailAdress, data.relationship, data.fatherNationality, data.fathersEducation, data.isFatherAlive], (error, results) => {
                if (!error) {
                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                        if (err) {
                            res.status(500).json({ message: err.sqlMessage });
                        } else {

                            res.status(200).json({ message: 'Account successfully updated' });
                        }
                    })


                } else {
                    console.log(error)
                    return res.status(500).json({ message: error.sqlMessage })
                }
            })
        } else {
            query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
            connection.query(query, [data.applicationNumber], (error, results) => {
                if (!error) {
                    if (results.length > 0) {
                        if (results[0].SerialStatus === 'PROCESSING') {
                            query = "UPDATE ApplicantfathersDetails SET fathersName=?,fathersOccupation=?,fathersPlaceofWork=?,fatherMobileNumber=?,fatherSecondaryNumber=?,fathersAddress=?,fathersEmailAdress=?,relationship=?,fatherNationality=?,fathersEducation=?,isFatherAlive=? WHERE SerialNumber=? "
                            connection.query(query, [data.fathersName, data.fathersOccupation, data.fathersPlaceofWork, data.fatherMobileNumber, data.fatherSecondaryNumber, data.fathersAddress, data.fathersEmailAdress, data.relationship, data.fatherNationality, data.fathersEducation, data.isFatherAlive, data.applicationNumber], (error, results) => {
                                if (error) {
                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                        if (err) {
                                            res.status(500).json({ message: err.sqlMessage });
                                        } else {

                                            res.status(200).json({ message: 'Account successfully updated' });
                                        }
                                    })
                                }
                            })
                        } else {
                            return res.status(500).json({ message: 'Registration is complete' })
                        }
                    } else {
                        console.log(error)
                        return res.status(500).json({ message: 'Registration progress not found' })
                    }
                } else {
                    console.log(error)
                    return res.status(500).json({ message: error.sqlMessage })
                }
            })
        }
    })
})

router.post('/mothersData', (req, res) => {
    let data = req.body
    query = "SELECT SerialNumber,motherName,mothersOccupation,mothersPlaceofWork,motherMobileNumber,mothersSecondaryNumber,mothersAddress,mothersEmailAdress,relationship,mathersNationality,mothersEducation,isMotherAlive FROM applicantmothersdetails WHERE SerialNumber=? "
    connection.query(query, [data.applicationNumber], (error, results) => {
        if (results <= 0) {
            console.log(data)
            query = "INSERT INTO applicantmothersdetails(SerialNumber,motherName,mothersOccupation,mothersPlaceofWork,motherMobileNumber,mothersSecondaryNumber,mothersAddress,mothersEmailAdress,relationship,mathersNationality,mothersEducation,isMotherAlive) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
            connection.query(query, [data.applicationNumber, data.motherName, data.mothersOccupation, data.mothersPlaceofWork, data.mothersPhoneNumber, data.mothersSecondaryPhoneNumber, data.mothersAddress, data.mothersEmailAdress, data.mothersrelationship, data.motherNationality, data.mothersEducation, data.isMotherAlive], (error, results) => {
                if (!error) {

                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                        if (err) {
                            res.status(500).json({ message: err.sqlMessage });
                        } else {

                            res.status(200).json({ message: 'Account successfully updated' });
                        }
                    })



                } else {
                    console.log(error)
                    return res.status(500).json({ message: error.sqlMessage })
                }
            })
        } else {
            query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
            connection.query(query, [data.applicationNumber], (error, results) => {
                if (results <= 0) {
                    console.log(error)
                    return res.status(500).json({ message: 'Registration progress not found' })
                } else {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {

                        query = "UPDATE applicantmothersdetails SET motherName=?,mothersOccupation=?,mothersPlaceofWork=?,motherMobileNumber=?,mothersSecondaryNumber=?,mothersAddress=?,mothersEmailAdress=?,relationship=?,mathersNationality=?,mothersEducation=?,isMotherAlive=? WHERE SerialNumber=?"
                        connection.query(query, [data.motherName, data.mothersOccupation, data.mothersPlaceofWork, data.mothersPhoneNumber, data.mothersSecondaryPhoneNumber, data.mothersAddress, data.mothersEmailAdress, data.mothersrelationship, data.motherNationality, data.mothersEducation, data.isMotherAlive, data.applicationNumber], (error, results) => {
                            if (!error) {
                                query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                    if (err) {
                                        res.status(500).json({ message: err.sqlMessage });
                                    } else {

                                        res.status(200).json({ message: 'Account successfully updated' });
                                    }
                                })

                            } else {
                                console.log(error)
                                return res.status(500).json({ message: error.sqlMessage })
                            }
                        })

                    }
                }


            })




        }
    })
})

router.post("/applicantHealth", (req, res) => {
    let data = req.body
    query = "SELECT SerialNumber,isApplicantinGoodHealth,descofHealth,applicanhasnormalEyesight,descriptionofEyeProblem,applicanhasnormalhearing,descofHearingProblem,foodAllergyDetails,adjustability,applicantAttide,applicantFullyImmuzed,traumaRelated FROM ApplicantHealthDeatils WHERE SerialNumber=?";
    connection.query(query, [data.applicationNumber], (error, results) => {
        if (!error) {
            if (results.length <= 0) {
                query = "INSERT INTO ApplicantHealthDeatils(SerialNumber,isApplicantinGoodHealth,descofHealth,applicanhasnormalEyesight,descriptionofEyeProblem,applicanhasnormalhearing,descofHearingProblem,foodAllergyDetails,adjustability,applicantAttide,applicantFullyImmuzed,traumaRelated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
                connection.query(query, [data.applicationNumber, data.isApplicantinGoodHealth, data.descofHealth, data.applicanhasnormalEyesight, data.descriptionofEyeProblem, data.applicanhasnormalhearing, data.descofHearingProblem, data.foodAllergyDetails, data.adjustability, data.applicantAttide, data.applicantFullyImmuzed, data.traumaRelated], (error, results) => {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        if (results.length > 0) {

                            query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                            connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                if (err) {
                                    res.status(500).json({ message: err.sqlMessage });
                                } else {

                                    res.status(200).json({ message: 'Account successfully updated' });
                                }
                            })

                        } else {
                            return res.status(500).json("An internal error occured try again")
                        }
                    }
                })
            } else {
                query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
                connection.query(query, [data.applicationNumber], (error, results) => {
                    if (error) {


                        return res.status(500).json({ message: error.sqlMessage })
                    } else {

                        if (results.length > 0) {

                            query = 'UPDATE ApplicantHealthDeatils SET isApplicantinGoodHealth=?,descofHealth=?,applicanhasnormalEyesight=?,descriptionofEyeProblem=?,applicanhasnormalhearing=?,descofHearingProblem=?,foodAllergyDetails=?,adjustability=?,applicantAttide=?,applicantFullyImmuzed=?,traumaRelated=? WHERE SerialNumber=?';
                            connection.query(query, [data.isApplicantinGoodHealth, data.descofHealth, data.applicanhasnormalEyesight, data.descriptionofEyeProblem, data.applicanhasnormalhearing, data.descofHearingProblem, data.foodAllergyDetails, data.adjustability, data.applicantAttide, data.applicantFullyImmuzed, data.traumaRelated, data.applicationNumber], (error, results) => {
                                if (error) {

                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log(data.progress)
                                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                        if (err) {
                                            res.status(500).json({ message: err.sqlMessage });
                                        } else {

                                            res.status(200).json({ message: 'Account successfully updated' });
                                        }
                                    })


                                }
                            })
                        } else {

                            return res.status(500).json({ message: "The system could not be updated. An error occured" })
                        }
                    }

                })


            }
        } else {
            console.log(error)
            return res.status(500).json({ message: error.sqlMessage })
        }

    })
})
router.post('/applicantFeeCommitments', (req, res) => {
    let data = req.body
   
    query = "SELECT SerialNumber,parentMarriageStatus,whopaysFee,PayeeTitle,nameofPayee,digitalofPayee,PayeeAddress,emailofPayee,PhoneNumberofPayee,nameofInstitution,postalAddressofInstitution,emailofInstitution,PhoneNumberofInstitution FROM PaymentofFee WHERE SerialNumber=?";
    connection.query(query, [data.applicationNumber, data.parentMarriageStatus, data.applicantCommitment, data.PayeeTitle, data.nameofPayee, data.digitalAddressofPayee, data.PayeeAddress, data.emailofPayee, data.PhoneNumberofPayee,
    data.nameofInstitution, data.postalAddressofInstitution, data.digitalAddressofInstitution, data.emailofInstitution, data.PhoneNumberofInstitution, data.applicationNumber
    ], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.sqlMessage })
        } else {
            if (results.length <= 0) {
                query = 'INSERT INTO  PaymentofFee(SerialNumber,parentMarriageStatus,whopaysFee,PayeeTitle,nameofPayee,digitalofPayee,PayeeAddress,emailofPayee,PhoneNumberofPayee,nameofInstitution,postalAddressofInstitution,emailofInstitution,PhoneNumberofInstitution)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
                connection.query(query, [data.applicationNumber, data.parentMarriageStatus, data.applicantCommitment, data.PayeeTitle, data.nameofPayee, data.digitalAddressofPayee, data.PayeeAddress, data.emailofPayee, data.PhoneNumberofPayee, data.nameofInstitution, data.postalAddressofInstitution, data.digitalAddressofInstitution, data.emailofInstitution, data.PhoneNumberofInstitution], (error, results) => {
                    if (error) {
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {

                        query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                        connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                            if (err) {
                                res.status(500).json({ message: err.sqlMessage });
                            } else {

                                res.status(200).json({ message: 'Account successfully updated' });
                            }
                        })

                    }
                })

            } else {
                query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
                connection.query(query, [data.applicationNumber], (error, results) => {
                    if (error) {
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        if (results <= 0) {
                            return res.status(500).json({ message: "Arror in the application form. Invalid Application Number" })
                        } else {
                         
                            query = "UPDATE PaymentofFee SET SerialNumber=?,parentMarriageStatus=?,whopaysFee=?,PayeeTitle=?,nameofPayee=?,digitalofPayee=?,PayeeAddress=?,emailofPayee=?,PhoneNumberofPayee=?,nameofInstitution=?,postalAddressofInstitution=?,emailofInstitution=?,PhoneNumberofInstitution=? WHERE SerialNumber=?";
                           
                            connection.query(query, [data.applicationNumber, data.parentMarriageStatus, data.applicantCommitment, data.PayeeTitle, data.nameofPayee, data.digitalAddressofPayee, data.PayeeAddress, data.emailofPayee, data.PhoneNumberofPayee, data.nameofInstitution, data.postalAddressofInstitution, data.digitalAddressofInstitution, data.emailofInstitution, data.PhoneNumberofInstitution, data.applicationNumber], (error, results) => {
                               
                                if (error) {
                                    return res.status(500).json({ message: error.sqlMessage })
                                } else {
                                    console.log(results)
                                    query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                    connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                        if (err) {
                                            res.status(500).json({ message: err.sqlMessage });
                                        } else {

                                            res.status(200).json({ message: 'Account successfully updated' });
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

router.post('/consentData', (req, res) => {
    // console.log(req.body)
    let data = req.body;
    query = "SELECT SerialNumber,CanUsePlayEquiptment,CanTakepartInschoolActivites,CanbeEvaluated,emergencyMedicalCare,EmergencyContact1,EmergencyContact2,EmergencyContact3,familyDocterContact1,familyDocterContact2,familyDocterContact3,callSchoolDoctor,callAmbulanceService,sendchildtoHospital,payallMedicalExpense,declaration FROM ParentConsent WHERE SerialNumber=?"
    connection.query(query, [data.applicationNumber, data.ApplicantCanUsePlayEquiptment, data.ApplicantCanTakepartInschoolActivites,
    data.ApplicancaLeaveschool, data.ApplicanCanbeEvaluated, data.emergencyMedicalCare, data.EmergencyContact1, data.EmergencyContact2, data.EmergencyContact3,
    data.familyDocterContact1, data.familyDocterContact2, data.familyDocterContact3, data.callSchoolDoctor, data.callAmbulanceService, data.sendchildtoHospital, data.payallMedicalExpense, data.declaration, data.applicationNumber
    ], (error, results) => {
        if (error) {
            res.status(500).json({ message: error.sqlMessage })
        } else {
            if (results <= 0) {

                query = "INSERT INTO ParentConsent (SerialNumber,CanUsePlayEquiptment,CanTakepartInschoolActivites,CanbeEvaluated,emergencyMedicalCare,EmergencyContact1,EmergencyContact2,EmergencyContact3,familyDocterContact1,familyDocterContact2,familyDocterContact3,callSchoolDoctor,callAmbulanceService,sendchildtoHospital,payallMedicalExpense,declaration) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                connection.query(query, [data.applicationNumber, data.ApplicantCanUsePlayEquiptment, data.ApplicantCanTakepartInschoolActivites,
                data.ApplicancaLeaveschool, data.ApplicanCanbeEvaluated, data.emergencyMedicalCare, data.EmergencyContact1, data.EmergencyContact2, data.EmergencyContact3,
                data.familyDocterContact1, data.familyDocterContact2, data.familyDocterContact3, data.callSchoolDoctor, data.callAmbulanceService, data.sendchildtoHospital, data.payallMedicalExpense, data.declaration
                ], (error, results) => {
                    if (error) {
                        res.status(500).json({ message: error.sqlMessage })
                    } else {
                        query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                        connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                            if (err) {
                                res.status(500).json({ message: err.sqlMessage });
                            } else {

                                res.status(200).json({ message: 'Account successfully updated' });
                            }
                        })



                    }

                })
            } else {
                query = "SELECT SerialStatus, SerialNumber FROM salesofapplicationserial WHERE SerialNumber=?"
                connection.query(query, [data.applicationNumber], (error, results) => {
                    if (error) {
                        return res.status(500).json({ message: error.sqlMessage })
                    } else {
                        if (results <= 0) {
                            return res.status(500).json({ message: "Arror in the application form. Invalid Application Number" })
                        } else {
                            if (results[0].SerialStatus === 'PROCESSING') {

                                query = "UPDATE ParentConsent SET CanUsePlayEquiptment=?,CanTakepartInschoolActivites=?,CanbeEvaluated=?,emergencyMedicalCare=?,EmergencyContact1=?,EmergencyContact2=?,EmergencyContact3=?,familyDocterContact1=?,familyDocterContact2=?,familyDocterContact3=?,callSchoolDoctor=?,callAmbulanceService=?,sendchildtoHospital=?,payallMedicalExpense=?,declaration=?  WHERE SerialNumber=?"
                                connection.query(query, [data.ApplicantCanUsePlayEquiptment, data.ApplicantCanTakepartInschoolActivites,
                                data.ApplicancaLeaveschool, data.ApplicanCanbeEvaluated, data.emergencyMedicalCare, data.EmergencyContact1, data.EmergencyContact2, data.EmergencyContact3,
                                data.familyDocterContact1, data.familyDocterContact2, data.familyDocterContact3, data.callSchoolDoctor, data.callAmbulanceService, data.sendchildtoHospital, data.payallMedicalExpense, data.declaration, data.applicationNumber
                                ], ((error, results) => {
                                    if (error) {
                                        return res.status(500).json({ message: error.sqlMessage })
                                    } else {
                                        query = 'UPDATE salesofapplicationserial SET ProcessStage=? WHERE SerialNumber=?'
                                        connection.query(query, [data.progress, data.applicationNumber], (err, result) => {
                                            if (err) {
                                                res.status(500).json({ message: err.sqlMessage });
                                            } else {

                                                res.status(200).json({ message: 'Account successfully updated' });
                                            }
                                        })

                                    }

                                }))

                            } else {
                                return res.status(200).json({ message: "Application process already complete" })
                            }


                        }
                    }
                })

            }
        }

    })

})
router.post('/finalSubmit', (req, res) => {
    console.log(req.body)
    let data = req.body
    query = "UPDATE salesofapplicationserial SET SerialStatus=?,ProcessStage=? WHERE SerialNumber=?";
    connection.query(query, [data.serialStatus, data.progress, data.applicationNumber], (error, results) => {
        if (!error) {
            return res.status(200).json({ message: "Application successfully submitted" })
        } else {
            return res.status(500).json({ message: error.sqlMessage })
        }
    })
})


//Loading all application data 
router.post('/personalData', (req, res) => {
    let data = req.body
    query = 'SELECT applicationNumber,applicantSurname,applicantMiddlename,applicantLastname,applicantNationality,applicantAddress,applicantGender,applicantDateofBirth,applicantAge,NumberofMaleSiblings,NumberofFemaleSiblings FROM applicantbiodata WHERE applicationNumber=?'
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {

            if (results.length > 0) {

                return res.status(200).json({
                    sname: results[0].applicantSurname,
                    mname: results[0].applicantMiddlename,
                    lname: results[0].applicantLastname,
                    appNation: results[0].applicantNationality,
                    appAddress: results[0].applicantAddress,
                    appGender: results[0].applicantGender,
                    appDOB: results[0].applicantDateofBirth,
                    appAge: results[0].applicantAge,
                    appMalesiblings: results[0].NumberofMaleSiblings,
                    appFemaleSiblings: results[0].NumberofFemaleSiblings
                })
            } else {
                res.status(200).json({ message: "No records" })
            }
        } else {
            res.status(500).json({ message: error.sqlMessage })
        }
    })
})
router.post('/fathersDetails', (req, res) => {
    let data = req.body;

    query = "SELECT SerialNumber,fathersName,fathersOccupation,fathersPlaceofWork,fatherMobileNumber,fatherSecondaryNumber,fathersAddress,fathersEmailAdress,relationship,fatherNationality,fathersEducation,isFatherAlive FROM ApplicantfathersDetails WHERE SerialNumber=? "
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {
            if (results.length > 0) {

                return res.status(200).json({

                    fatheersName: results[0].fathersName,
                    fatherOccu: results[0].fathersOccupation,
                    fatherPoWork: results[0].fathersPlaceofWork,
                    primPhone: results[0].fatherMobileNumber,
                    secPhone: results[0].fatherSecondaryNumber,
                    fathAddress: results[0].fathersAddress,
                    fathEmail: results[0].fathersEmailAdress,
                    fathRelationship: results[0].relationship,
                    fathNationality: results[0].fatherNationality,
                    fatherEduc: results[0].fathersEducation,
                    isFatherAlive: results[0].isFatherAlive,
                })
            } else {

            }

        } else {
            res.status(500).json({ message: error.sqlMessage })
        }
    })
})

router.post('/loadMothersDetails', (req, res) => {
    let data = req.body
    query = "SELECT SerialNumber,motherName,mothersOccupation,mothersPlaceofWork,motherMobileNumber,mothersSecondaryNumber,mothersAddress,mothersEmailAdress,relationship,mathersNationality,mothersEducation,isMotherAlive FROM applicantmothersdetails WHERE SerialNumber=? "
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {
            if (results.length > 0) {
                res.status(200).json({
                    mothName: results[0].motherName,
                    mothOccupation: results[0].mothersOccupation,
                    MothPofWork: results[0].mothersPlaceofWork,
                    mothPriPhone: results[0].motherMobileNumber,
                    mothSecPhone: results[0].mothersSecondaryNumber,
                    mothAddress: results[0].mothersAddress,
                    mothEmailAdress: results[0].relationship,
                    Mothrelationship: results[0].relationship,
                    mothNationality: results[0].mathersNationality,
                    mothEducation: results[0].mothersEducation,
                    MothisAlive: results[0].isMotherAlive

                })
            } else {

            }
        } else {
            res.status(500).json({
                message: error.sqlMessage
            })
        }


    })
})
router.post('/loadApplicantHealthData', (req, res) => {
    let data = req.body
    query = "SELECT SerialNumber,isApplicantinGoodHealth,descofHealth,applicanhasnormalEyesight,descriptionofEyeProblem,applicanhasnormalhearing,descofHearingProblem,foodAllergyDetails,adjustability,applicantAttide,applicantFullyImmuzed,traumaRelated FROM ApplicantHealthDeatils WHERE SerialNumber=?"
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {

            if (results.length > 0) {

                res.status(200).json({
                    hasGoogHealth: results[0].isApplicantinGoodHealth,
                    descofHealth: results[0].descofHealth,
                    hasNormalEye: results[0].applicanhasnormalEyesight,
                    EyeProblem: results[0].descriptionofEyeProblem,
                    hasNormalHearing: results[0].applicanhasnormalhearing,
                    hearingProblem: results[0].descofHearingProblem,
                    foodAllergy: results[0].foodAllergyDetails,
                    isadjustable: results[0].adjustability,
                    applicantAttide: results[0].applicantAttide,
                    isImmuzed: results[0].applicantFullyImmuzed,
                    traumaRelated: results[0].traumaRelated

                })
            } else {

            }
        } else {
            res.status(500).json({ message: error.sqlMessage })
        }

    })

})
router.post('/loadpaymentDetails', (req, res) => {

    let data = req.body
    query = "SELECT SerialNumber,parentMarriageStatus,whopaysFee,PayeeTitle,nameofPayee,digitalofPayee,PayeeAddress,emailofPayee,PhoneNumberofPayee,nameofInstitution,postalAddressofInstitution,emailofInstitution,PhoneNumberofInstitution,digitalAddressofInstitution FROM PaymentofFee WHERE SerialNumber=?";
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {
            if (results.length > 0) {
                res.status(200).json({
                    ptMarriageStatus: results[0].parentMarriageStatus,
                    whopCommitment: results[0].whopaysFee,
                    Title: results[0].PayeeTitle,
                    namePayee: results[0].nameofPayee,
                    digiAddressPayee: results[0].digitalofPayee,
                    PayeeAdd: results[0].PayeeAddress,
                    emailPayee: results[0].emailofPayee,
                    PhoneofPayee: results[0].PhoneNumberofPayee,
                    nameofInst: results[0].nameofInstitution,
                    postalAddrInst: results[0].postalAddressofInstitution,
                    emailInst: results[0].emailofInstitution,
                    PhoneNumbInst: results[0].PhoneNumberofInstitution,
                    digiAddressofInstitution: [0].digitalAddressofInstitution
                })
            }
        } else {
            res.status(500).json({ message: error.sqlMessage })
        }

    })
})
router.post('/loadPrentconsent', (req, res) => {
    let data = req.body
    query = "SELECT SerialNumber,CanUsePlayEquiptment,CanTakepartInschoolActivites,CanbeEvaluated,emergencyMedicalCare,EmergencyContact1,EmergencyContact2,EmergencyContact3,familyDocterContact1,familyDocterContact2,familyDocterContact3,callSchoolDoctor,callAmbulanceService,sendchildtoHospital,payallMedicalExpense,declaration FROM ParentConsent WHERE SerialNumber=?"
    connection.query(query, [data.serialNumber], (error, results) => {
        if (!error) {
            if (results.length > 0) {
                res.status(200).json({
                    PlayEquip: results[0].CanUsePlayEquiptment,
                    schoolActivites: results[0].CanTakepartInschoolActivites,
                    evaluationAllowed: results[0].CanbeEvaluated,
                    emergMedicalCare: results[0].emergencyMedicalCare,
                    EmergContact1: results[0].EmergencyContact1,
                    EmergContact2: results[0].EmergencyContact2,
                    EmergContact3: results[0].familyDocterContact3,
                    famDocContact1: results[0].familyDocterContact1,
                    famDocContact2: results[0].familyDocterContact2,
                    famDocContact3: results[0].sendchildtoHospital,
                    SchoolDoc: results[0].callSchoolDoctor,
                    AmbService: results[0].callAmbulanceService,
                    sendHospital: results[0].sendchildtoHospital,
                    payMedExpense: results[0].payallMedicalExpense,
                    declara: results[0].declaration
                })
            } else {

            }
        } else {
            return res.status(500).json({ message: error.sqlMessage })
        }
    })

})


router.post('/loadfinalStage', (req, res) => {
    let data = req.body
    query = "SELECT applicantbiodata.applicationNumber,applicantbiodata.applicantSurname,applicantbiodata.applicantMiddlename,applicantbiodata.applicantLastname,applicantbiodata.applicantNationality,applicantbiodata.applicantAddress,applicantbiodata.applicantGender,applicantbiodata.applicantDateofBirth,applicantbiodata.applicantAge,applicantbiodata.NumberofMaleSiblings,applicantbiodata.NumberofFemaleSiblings,ApplicantfathersDetails.fathersName,ApplicantfathersDetails.fathersOccupation,ApplicantfathersDetails.fathersPlaceofWork,ApplicantfathersDetails.fatherMobileNumber,ApplicantfathersDetails.fatherSecondaryNumber,ApplicantfathersDetails.fathersAddress,ApplicantfathersDetails.fathersEmailAdress,ApplicantfathersDetails.relationship,ApplicantfathersDetails.fatherNationality,ApplicantfathersDetails.fathersEducation,ApplicantfathersDetails.isFatherAlive,applicantmothersdetails.motherName,applicantmothersdetails.mothersOccupation,applicantmothersdetails.mothersPlaceofWork,applicantmothersdetails.motherMobileNumber,applicantmothersdetails.mothersSecondaryNumber,applicantmothersdetails.mothersAddress,applicantmothersdetails.mothersEmailAdress,applicantmothersdetails.relationship,applicantmothersdetails.mathersNationality,applicantmothersdetails.mothersEducation,applicantmothersdetails.isMotherAlive,ApplicantHealthDeatils.isApplicantinGoodHealth,ApplicantHealthDeatils.descofHealth,ApplicantHealthDeatils.applicanhasnormalEyesight,ApplicantHealthDeatils.descriptionofEyeProblem,ApplicantHealthDeatils.applicanhasnormalhearing,ApplicantHealthDeatils.descofHearingProblem,ApplicantHealthDeatils.foodAllergyDetails,ApplicantHealthDeatils.adjustability,ApplicantHealthDeatils.applicantAttide,ApplicantHealthDeatils.applicantFullyImmuzed,ApplicantHealthDeatils.traumaRelated,PaymentofFee.parentMarriageStatus,PaymentofFee.whopaysFee,PaymentofFee.PayeeTitle,PaymentofFee.nameofPayee,PaymentofFee.digitalofPayee,PaymentofFee.PayeeAddress,PaymentofFee.emailofPayee,PaymentofFee.PhoneNumberofPayee,PaymentofFee.nameofInstitution,PaymentofFee.postalAddressofInstitution,PaymentofFee.emailofInstitution,PaymentofFee.PhoneNumberofInstitution,PaymentofFee.digitalAddressofInstitution,ParentConsent.CanUsePlayEquiptment,ParentConsent.CanTakepartInschoolActivites,ParentConsent.CanbeEvaluated,ParentConsent.emergencyMedicalCare,ParentConsent.EmergencyContact1,ParentConsent.EmergencyContact2,ParentConsent.EmergencyContact3,ParentConsent.familyDocterContact1,ParentConsent.callSchoolDoctor,ParentConsent.callAmbulanceService,ParentConsent.sendchildtoHospital,ParentConsent.payallMedicalExpense,ParentConsent.declaration FROM applicantbiodata LEFT JOIN ApplicantfathersDetails ON applicantbiodata.applicationNumber=ApplicantfathersDetails.SerialNumber LEFT JOIN applicantmothersdetails ON applicantbiodata.applicationNumber=applicantmothersdetails.SerialNumber LEFT JOIN ApplicantHealthDeatils ON  applicantbiodata.applicationNumber=ApplicantHealthDeatils.SerialNumber LEFT JOIN PaymentofFee ON applicantbiodata.applicationNumber=PaymentofFee.SerialNumber LEFT JOIN ParentConsent ON applicantbiodata.applicationNumber=ParentConsent.SerialNumber WHERE applicantbiodata.applicationNumber=?";

    connection.query(query, [data.serialNumber], (error, results) => {
        if(error){
            console.log(error.sqlMessage)
            return res.json({message:error.sqlMessage})
        }else{
            if(results.length>0){
                return res.status(200).json({
                    applicationNumber:results[0].applicationNumber,
                    sname: results[0].applicantSurname,
                    mname: results[0].applicantMiddlename,
                    lname: results[0].applicantLastname,
                    appNation:results[0].applicantNationality,
                    appAddress:results[0].applicantAddress,
                    appGender:results[0].applicantGender,
                    appDOB:results[0].applicantDateofBirth,
                    appAge:results[0].applicantAge,
                    appMalesiblings:results[0].NumberofMaleSiblings,
                    appFemaleSiblings:results[0].NumberofFemaleSiblings,
                    fatheersName:results[0].fathersName,
                    fatherOccu:results[0].fathersOccupation,
                    fatherPoWork:results[0].fathersPlaceofWork,
                    primPhone:results[0].fatherMobileNumber,
                    secPhone:results[0].fatherSecondaryNumber,
                    fathAddress:results[0].fathersAddress,
                    fathEmail:results[0].fathersEmailAdress,
                    fathRelationship:results[0].relationship,
                    fathNationality:results[0].fatherNationality,
                    fatherEduc: results[0].fathersEducation,
                    isFatherAlive:results[0].isFatherAlive,
                    mothName:results[0].motherName,
                    mothOccupation:results[0].mothersOccupation,
                    MothPofWork:results[0].mothersPlaceofWork,
                    mothPriPhone:results[0].motherMobileNumber,
                    mothSecPhone:results[0].mothersSecondaryNumber,
                    mothAddress:results[0].mothersAddress,
                    mothEmailAdress:results[0].mothersEmailAdress,
                    Mothrelationship:results[0].relationship,
                    mothNationality:results[0].mathersNationality,
                    mothEducation:results[0].mothersEducation,
                    MothisAlive:results[0].isMotherAlive,
                    hasGoogHealth: results[0].isApplicantinGoodHealth,
                    descofHealth:results[0].descofHealth,
                    hasNormalEye:results[0].applicanhasnormalEyesight,
                    EyeProblem:results[0].descriptionofEyeProblem,
                    hasNormalHearing:results[0].applicanhasnormalhearing,
                    hearingProblem:results[0].descofHearingProblem,
                    foodAllergy:results[0].foodAllergyDetails,
                    isadjustable:results[0].adjustability,
                    applicantAttide:results[0].applicantAttide,
                    isImmuzed:results[0].applicantFullyImmuzed,
                    traumaRelated:results[0].traumaRelated,
                    ptMarriageStatus:results[0].parentMarriageStatus,
                    whopCommitment:results[0].whopaysFee,
                    Title:results[0].PayeeTitle,
                    namePayee:results[0].nameofPayee,
                    digiAddressPayee:results[0].digitalofPayee,
                    PayeeAdd:results[0].PayeeAddress,
                    emailPayee:results[0].emailofPayee,
                    PhoneofPayee:results[0].PhoneNumberofPayee,
                    nameofInst:results[0].nameofInstitution,
                    postalAddrInst:results[0].postalAddressofInstitution,
                    emailInst:results[0].emailofInstitution,
                    PhoneNumbInst:results[0].PhoneNumberofInstitution,
                    digiAddressofInstitution:results[0].digitalAddressofInstitution,
                    PlayEquip:results[0].CanUsePlayEquiptment,
                    schoolActivites:results[0].CanTakepartInschoolActivites,
                    evaluationAllowed:results[0].CanbeEvaluated,
                    emergMedicalCare:results[0].emergencyMedicalCare,
                    EmergContact1:results[0].EmergencyContact1,
                    EmergContact2:results[0].EmergencyContact2,
                    EmergContact3:results[0].EmergencyContact3,
                    famDocContact1:results[0].familyDocterContact1,
                    famDocContact2:results[0].familyDocterContact2,
                    famDocContact3:results[0].familyDocterContact3,
                    AmbService: results[0].callAmbulanceService,
                    sendHospital: results[0].sendchildtoHospital,
                    payMedExpense: results[0].payallMedicalExpense,
                    declara: results[0].declaration
                })
            }else{
                res.status(500).json({message:"Internal error occured. Records could not be loaded"})
            }
        }
    })
})
module.exports = router;