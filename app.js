const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const moment = require('moment');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));

// Configuring the database
const dbConfig = require('./config/database.config.js');
mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    dbName: "socialdistance",
    useFindAndModify: false,
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

//default
app.get('/', (req, res) => {
    //do something
    res.json({
        status: 'working'
    })
});

// Require event routes
require('./api/routes/auth.route.js')(app);
require('./api/routes/record.route.js')(app);

// require('./api/routes/blog.route.js')(app);
//require('./api/routes/util.route.js')(app);

app.listen(3300);
console.log('listening on port');

schedule.scheduleJob('0 0 * * *', async () => { 
    let response = await (await fetch("http://localhost:3300/api/transferAll")).json();
    console.log({
        date: moment().format('YYYY-MM-DD'),
        success: response.success
    });
});