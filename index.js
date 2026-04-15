const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRoute = require('./routes/user');
const addmissionform = require('./routes/addmissionform');
const admissions = require('./routes/admissions');
const Academics = require('./routes/academics');
const Learneraccount = require('./routes/leaneraccount')


const app = express();


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/user', userRoute);
app.use('/addmissionform', addmissionform)
app.use('/admissions', admissions)
app.use('/academics', Academics)
app.use('/leaneraccount',Learneraccount)


module.exports = app;