const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//TODO: Create all routes here!
const baseRouter = require('./routes/base');
const tokensRouter = require('./routes/tokens');
const tagsRouter = require('./routes/tags');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle cross browser problems
// feel free to just ignore this and let it do it's thing
app.all('/*', (req, res, next) => {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,X-Requested-With,Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Expose-Headers', 'total-rows');
    if (req.method == 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
});

//adding our libraries in and setting up express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*ROUTES*/

//The database end point will stay commented out unless there is an actual database
//  that is setup, if a database exists, open lib/db and enter the db info accordingly.
//app.use('/db', databaseRouter); //All end points from this path will be related to our database

app.use('/api/', baseRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/tags', tagsRouter);
                                

//0.0.0.0 is the localhost and runs on your chosen port
//server can be accessed from browser at 'localhost:<portnumber>' as the url
app.listen(port, '0.0.0.0', () => {
    console.log(`\nYour template server is up and running!`);
    console.log(`The server will run as long as this process in this terminal\nis not interrupted`);
    console.log(`To kill server Press Ctrl-C or close the terminal`);
    console.log(`Open a browser and enter 'localhost:${port}/' as the URL to view your server`);
});

