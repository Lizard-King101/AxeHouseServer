const mysql = require('mysql');
const con = mysql.createConnection(global.database);
var connected = false;

function Query(sql){
    return new Promise((res)=>{
        Connect().then((err)=>{
            if(err) res({error: err});
            con.query(sql, (err, result)=>{
                if(err) res({error: err});
                res(result);
            })
        })
    })
}

function Select(options){
    return new Promise((res)=>{
        if(!options.table) res({error: 'No Table defined'});
        sql = `SELECT ${options.columns ? options.columns.join(',') : '*'} FROM ${options.table} ${(options.where ? 'WHERE ' + [options.where].join(' ') : '')}`;
        Connect().then((err)=>{
            if(err) res({error: err});
            con.query(sql, (err, result)=>{
                if(err) res({error: err});
                res(result.length && result.length > 0 ? result : false);
            })
        })
    })
}

function GetRow(sql) {
    return new Promise((res) => {
        Query(sql).then((result) => {
            if(result.error) res(result);
            else res(result.length > 0 ? result[0] : false);
        })
    })
}

function Insert(table, data) {
    return new Promise((res) => {
        LoadData(table, data).then((data) => {
            if(data.error) res(data);
            Query(`INSERT INTO ${table} (${'`' + Object.keys(data).join('`,`') + '`'}) VALUES (${'"' + Object.values(data).join('","') + '"'})`).then((result) => {
                if(result.error) res(result);
                else res(data);
            })
        })
    })
}

function LoadData(table, data) {
    return new Promise((res) => {
        Query(`DESCRIBE ${table}`).then((table) => {
            if(table.error) res(table);
            returnData = {};
            table.forEach((col, i) => {
                let key = col.Field;
                if( data[key] ){
                    returnData[key] = data[key];
                }
                if(i === table.length - 1) res(returnData);
            });
        })
    })
}

function Connect(){
    return new Promise((res)=>{
        if(connected) res();
        else con.connect((err)=>{
            if(err) res(err);
            connected = true;
            res();
        })
    })
}



module.exports.select = Select;
module.exports.query = Query;
module.exports.getRow = GetRow;
module.exports.insert = Insert;