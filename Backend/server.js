require("dotenv").config();
const express = require("express");
var mysql = require("mysql");

const app = express();
const port = process.env.PORT;
const cors = require("cors");

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DBHOST,
    user            : process.env.DBUSER,
    password        : process.env.DBPASS,
    database        : process.env.DBNAME,
    timezone        : 'UTC'
});

// MIDDLEWARE FUNCTION

app.use(express.urlencoded({extended: true}))
app.use(cors());
app.use(express.json());

// ENDPOINTS

app.get("/", (req, res) => {
    res.send("Simple NodeJS Backend API");
});


// logincheck

app.post('/logincheck', (req, res) =>{
    let table = 'users';
    let field1 = 'email';
    let field2 = 'passwd';
    let value = req.body.email;
    let value2 = req.body.passwd;

    pool.query(`SELECT * FROM ${table} WHERE ${field1}='${value}' AND ${field2}='${value2}'`, (err, results) =>{
        sendResults(table, err, results, req, res, 'logincheck from');
    });
});




// GET all records
app.get("/:table", (req, res) => {
    let table = req.params.table

    pool.query(`SELECT * FROM ${table}`, (err, results) => {
        sendResults(table, err, results, req, res, "sent from");
    });
});

// GET one record by id
app.get("/:table/:id", (req, res) => {
    let table = req.params.table
    let id = req.params.id

    pool.query(`SELECT * FROM ${table} WHERE ID = ${id}`, (err, results) => {
        sendResults(table, err, results, req, res, "sent from");
    });
});

// GET records by field
app.get("/:table/:field/:op/:value", (req, res) => {
    let table = req.params.table
    let field = req.params.field;
    let value = req.params.value;
    let op = getOperator(req.params.op);

    if(op == "like"){
        value = `%${value}%`;
    }

    pool.query(`SELECT * FROM ${table} WHERE ${field}${op}'${value}'`, (err, results) => {
        sendResults(table, err, results, req, res, "sent from");
    });
});

// POST new record to table

app.post("/users", (req,res) => {

    pool.query(`INSERT INTO users VALUES (null, '${req.body.name}', '${req.body.email}', '${req.body.passwd}')`, (err, results) => {
        sendResults("users", err, results, req, res, "insert into");
    });
});


app.post("/items", (req,res) => {

    pool.query(`INSERT INTO items VALUES (null, '${req.body.loggedUser}', '${req.body.date}', '${req.body.select}', '${req.body.amount}', '${req.body.tag}')`, (err, results) => {
        sendResults("items", err, results, req, res, "insert into");
    });
});

// PATCH record in table by field (update)
app.patch('/:table', (req, res) =>{
    let table = req.params.table;
    let field = req.params.table;
    let value = req.params.table;
    let op = getOperator(req.params.op);

    if (op == ' like ') {
        value = `%${value}%`;
    }

    let values = Object.values(req.body);
    let fields = Object.keys(req.body);
    
    let sql = '';
    for (let i = 0; i < values.length; i++) {
        sql += fields[i] + `='` + values[i] + `',`;
        if (i< values.length-1)
        {
            sql += ',';
        }
        
    }

    console.log(sql);

    pool.query(`UPDATE ${table} SET ${sql} WHERE ${field}, '${value}', ${op}`, (err, results) =>{
        sendResults(table, err, results, req, res, 'updated in');
    })
})

// DELETE one record by ID
app.get("/:table/:id", (req, res) => {
    let table = req.params.table;
    let id = req.params.id;

    pool.query(`DELETE * FROM ${table} WHERE ID = ${id}`, (err, results) => {
        sendResults(table, err, results, req, res, "sent from");
    });
});


// DELETE record from table by field
app.delete('/:table/:field/:op/:value', (req, res) =>{
    let table = req.params.table;
    let field = req.params.table;
    let value = req.params.table;
    let op = getOperator(req.params.op);

    if (op == ' like ') {
        value = `%${value}%`;
    }

    pool.query(`DELETE FROM ${table} WHERE ${field$} ${op} '${value}'`, (err, results) =>{
        sendResults(table, err, results, req, res, 'deleted from');
    });
});

// DELETE all records from table
app.delete('/:table', (req, res) =>{
    let table = req.params.table;
    pool.query(`DELETE FROM ${table}`, (err, results) =>{
        sendResults(table, err, results, req, res, 'deleted from');
    });
});


// send results to the client
function sendResults(table, err, results, req, res, msg){
    if (err){
        console.log(req.socket.remoteAddress + " >> " + err.sqlMessage);
        res.status(500).send(err.sqlMessage);
    }
    else{
        console.log(req.socket.remoteAddress + " >> " + results.length + ` record(s) ${msg} ${table} table.`);
        res.status(200).send(results);
    }
}

// change operator value
function getOperator(op){
    switch (op){
        case "eq": op = "=";break;
        case "lt": op = "<";break;
        case "gt": op = ">";break;
        case "lte": op = "<=";break;
        case "gte": op = ">=";break;
        case "not": op = "!=";break;
        case "lk": op = "like";break;
    }
    return op
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});