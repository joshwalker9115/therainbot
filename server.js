const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require("path");
const StationList = require('./routes/api/StationList');
const dailyCron = require('./dailyCron');
//const RainData = require('./routes/api/RainData');

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, "client/build")));


// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Use routes
app.use('/api/StationList', StationList);
//app.use('/api/RainData', RainData);

// Provide SSL code
app.get('/.well-known/acme-challenge/6qQV-Edt6zj8lM7-xpJBJ9Bmiscdh5sHuTusTuGkDSM', (req, res) => {
    res.send('6qQV-Edt6zj8lM7-xpJBJ9Bmiscdh5sHuTusTuGkDSM.3CMZPPuAi8ZEWkqSpM-SITuw_EGcp8sU0oDzg3mlVsg')
});

// Server static assets if in build mode
if (process.env.NODE_ENV === 'production') {
    //Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

//wvCall();