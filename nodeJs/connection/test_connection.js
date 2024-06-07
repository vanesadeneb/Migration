import { Connection }from 'tedious';
import { sqlConfig } from './connection.js'

var config = {  
    server: 'DESKTOP-35V5QTJ',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', //update me
            password: 'Vanesa02$'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'licencias',  //update me
        port: 1433
    }
};  
var connection = new Connection(sqlConfig);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});

connection.connect();