const mysql = require('mysql');
const express = require('express');
const ejs=require('ejs');
const app=express();
const bodyParser=require("body-parser");
const path=require('path');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('view engine','ejs');

const connection=mysql.createConnection({
host:'localhost',
user:'root',
password:'',
database:'santévie'
});

connection.connect(error=>{
    if(error) throw error;
    console.log('Connected to the database');
});
app.use(express.static(__dirname + '/views'));
app.use(express.static('public'));
//app.use('/assets',express.static(__dirname + 'public/assets'))
//app.use('/images',express.static(__dirname + 'public/images'))

app.use(express.json())//To diplay data in the form of Json
app.listen(3000,()=>{
    console.log('Server started on port 3000')
})

app.get("/home",function(req,res){
    const query1 = 'SELECT * FROM patient';
  const query2 = 'SELECT * FROM appointments';
  connection.query(query1, (error, patientResults) => {
    if (error) throw error;
    connection.query(query2, (error, appointmentResults) => {
      if (error) throw error;
      res.render('home', {
        patientCount: patientResults.length,
        appointmentCount: appointmentResults.length
      });
    });
  });
})
// render the number of patients and number of appointments that the doctor has
app.get('/', function(req, res) {

  const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
let currentDate = `${day}-${month}-${year}`;
  const query1 = 'SELECT * FROM patient';
  const query2 = 'SELECT * FROM appointments';
  const query3='SELECT * FROM patient WHERE gender="female"';
  const query4='SELECT *FROM patient WHERE gender="male"';
  
  

  connection.query(query1, (error, patientResults) => {
    if (error) throw error;
    connection.query(query2, (error, appointmentResults) => {
      if (error) throw error;
     connection.query(query3, (error, femaleResults) => {
      if (error) throw error;  
        connection.query(query4, (error, maleResults) => {
      if (error) throw error;  
          
      res.render('index', {
        patientCount: patientResults.length,
        appointmentCount: appointmentResults.length,
        patient:patientResults,
        appointments:appointmentResults,
        currentDate:currentDate,
        femaleCount:femaleResults.length,
        maleCount:maleResults.length,
      });
    });
  });
});
  });
});


//render the page where the doctor can insert a new patient
app.get("/insert",function(req,res){
    res.render("insert");
})

//render table with all patients that the doctor has
app.get('/table', (req,res)=>{
    const query='select * FROM patient';

    connection.query(query, (error, results)=>{
         if(error) throw error;
         //res.send(results);
         res.render('table',{'patient':results});
         //res.render('patient', {patient:results});
});
});


//save the data of the new patient that the doctor has inserted

app.post('/save',(req,res)=>{
    const {patient_id,Name,gender,age,address,phone,email,medical_history}=req.body;
    const query=`INSERT INTO patient(patient_id,Name,gender,age,address,phone,email,medical_history) VALUES ("${patient_id}","${Name}","${gender}","${age}","${address}","${phone}","${email}","${medical_history}")`;
    connection.query(query,error=>{
        if (error) throw error;
        res.json({"ResponseCode":"1","ResponseMessage":"success","data":"Data Inserted Successfully!"});
    });
});

//modify existing data of patient
app.post('/update',(req,res)=>{
    const patient_id = req.body.patient_id;
    const query = `UPDATE patient SET Name="${req.body.Name}", gender="${req.body.gender}", age="${req.body.age}", address="${req.body.address}", phone="${req.body.phone}", email="${req.body.email}", medical_history="${req.body.medical_history}" WHERE patient_id=${connection.escape(patient_id)}`;
    connection.query(query,error=>{
        if (error) throw error;
        res.render('update', { patient_id: patient_id } )
    });
});

app.get("/update",function(req,res){
    res.render("update");
})
//delete a patient from the patients table
app.post('/delete',(req,res)=>{
    const patient_id = req.body.patient_id;
    connection.query(`DELETE FROM patient WHERE patient_id=${connection.escape(patient_id)}`, (error,results)=>{
        if(error) throw error;
        res.render('delete', { patient_id: patient_id } )
    });
});
app.get("/delete",function(req,res){
    res.render("delete");
})

//Save new appointment details
app.post('/saveApp',(req,res)=>{
    const {appointment_id,patient_id,doctor_id,booked_date,slot,patient_desc,prescription}=req.body;
    const query=`INSERT INTO appointments(appointment_id,patient_id,doctor_id,booked_date,slot,patient_desc,prescription) VALUES ("${appointment_id}","${patient_id}","${doctor_id}","${booked_date}","${slot}","${patient_desc}","${prescription}")`;
    connection.query(query,error=>{
        if (error) throw error;
        res.json({"ResponseCode":"1","ResponseMessage":"success","data":"Data Inserted Successfully!"});
    });
});
//render the page where the doctor can insert a new appointment
app.get("/insertApp",function(req,res){
    res.render("insertApp");
})


//modify existing appointment details
app.post('/updateApp',(req,res)=>{
    const appointment_id = req.body.appointment_id;
    const query = `UPDATE appointments SET patient_id="${req.body.patient_id}", doctor_id="${req.body.doctor_id}", booked_date="${req.body.booked_date}", slot="${req.body.slot}", patient_desc="${req.body.patient_desc}", prescription="${req.body.prescription}" WHERE appointment_id=${connection.escape(appointment_id)}`;
    connection.query(query,error=>{
        if (error) throw error;
        res.render('updateApp', { appointment_id: appointment_id } )
    });
});

app.get("/updateApp",function(req,res){
    res.render("updateApp");})

    //delete an appointment from appointments table
app.post('/deleteApp',(req,res)=>{
    const appointment_id = req.body.appointment_id;
    connection.query(`DELETE FROM appointments WHERE appointment_id=${connection.escape(appointment_id)}`, (error,results)=>{
        if(error) throw error;
        res.render('deleteApp', { appointment_id: appointment_id } )
    });
});
app.get("/deleteApp",function(req,res){
    res.render("deleteApp");
})