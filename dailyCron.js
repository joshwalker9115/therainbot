const axios = require('axios');
const nodemailer = require('nodemailer');
const cronJob = require('cron').CronJob;

const express = require('express');
const router = express.Router();


// Station Model
const StationList = require('./models/StationList');

// Setup dates
// const today = new Date();
// const yesterday = new Date(new Date().setDate(new Date().getDate()-1));

// Setup SMTP config
let smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'RainBotWeather',
        pass: 'ComplianceRainB0t!'
    }
};

// Setup transporter
let transporter = nodemailer.createTransport(smtpConfig);

// Verify Connection
transporter.verify( (error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

//define functions

class Csv {
    parseLine(text) {
      const regex =
      /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      let arr = [];
      text.replace(regex, (m0, m1, m2, m3) => {
        if (m1 !== undefined) {
          arr.push(m1.replace(/\\'/g, "'"));
        } else if (m2 !== undefined) {
          arr.push(m2.replace(/\\"/g, "\""));
        } else if (m3 !== undefined) {
          arr.push(m3);
        }
        return "";
      });
      if (/,\s*$/.test(text)) {
        arr.push("");
      }
      return arr;
    }
  
    zipObject(props, values) {
      return props.reduce((prev, prop, i) => {
        prev[prop] = values[i];
        return prev;
      }, {});
    }
  
    parse(csv) {
      let [properties, ...data] = csv.split("\n").map(this.parseLine);
      return data.map((line) => this.zipObject(properties, line))
    };
  
    serialize(obj) {
      let fields = Object.keys(obj[0]);
      let csv = obj.map(row => fields.map((fieldName) => JSON.stringify(row[fieldName] || "")));
      return [fields, ...csv].join("\n");
    }; 
}

const csv = new Csv();

let getData = (stationID) => {
    try {
        const urlBase = "https://cors-anywhere.herokuapp.com/https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=";
        const today = new Date();
        const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        const todayY = today.getFullYear();
        const todayM = today.getMonth()+1;
        const todayD = today.getDate();
        const yesterdayY = today.getFullYear();
        const yesterdayM = yesterday.getMonth()+1;
        const yesterdayD = yesterday.getDate();
        const url = `${urlBase}${stationID}&day=${yesterdayD}&month=${yesterdayM}&year=${yesterdayY}&dayend=${todayD}&monthend=${todayM}&yearend=${todayY}&graphspan=custom&format=1`;
        return axios({
        method:'get',
        url:url,
        headers: {
            Accept:'text/html',
            'Content-Type': 'text/html',
            Origin:'example.com'
            },
        })
    } catch (error) {
        console.error(error)
    }
}


const getStations = (data) => {
    return axios.get(`http://localhost:5000/api/StationList/${data}`, data)
        //.then(res => console.log(res.data))
        .then(response => {
            // returning the data here allows the caller to get it through another .then(...)
            // console.log("\n\nTesting\n\n", response.data)
            return response.data
          })
        .catch(err => console.log(err))
}


async function parseToMail (obj) {
    let { jobName, primary, secondary, tertiary, trigger } = obj;
    let list = [primary, secondary, tertiary];
    list = list.filter(el => el != null);
    const pArray = list.map( async ls => {
        const formatted = await getData(ls);
        return (((formatted.data).replace(/[<]br[^>]*[>]/gi,"")).replace(/^\s*\n/gm, "")).trim();
    });
    const mailLines = await Promise.all(pArray);

    let fullMail = '';

    for (i=0;i<mailLines.length;i++) {
        pData = csv.parse(mailLines[i]);
        trig = (typeof(trigger) === 'number') ? trigger.toFixed(2) : trigger
        //create hyperlinks here from list[i] variable
        let hyperLink = `https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=${list[i]}#history`

        if ((!Array.isArray(pData) || !pData.length)) {
            fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td>N/A</td><td>N/A</td><td>N/A</td><td>${trig}</td></tr>\n`
        } else {
            console.log(pData);
            yDay = pData[0].PrecipitationSumIn || false
            tDay = pData[1].PrecipitationSumIn || false
            tpy = (+pData[0].PrecipitationSumIn + +pData[1].PrecipitationSumIn).toFixed(2) || false

            if (yDay > 0.50 && tDay > 0.50) {
                fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td bgcolor="#FF0000">${yDay}</td><td bgcolor="#FF0000">${tDay}</td><td bgcolor="#FF0000">${tpy}</td><td bgcolor="#FF0000">${trig}</td></tr>\n`
            } else if (yDay > 0.50) {
                fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td bgcolor="#FF0000">${yDay}</td><td>${tDay || 'N/A'}</td><td bgcolor="#FF0000">${tpy}</td><td bgcolor="#FF0000">${trig}</td></tr>\n`
            } else if (tDay > 0.50) {
                fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td>${yDay || 'N/A'}</td><td bgcolor="#FF0000">${tDay}</td><td bgcolor="#FF0000">${tpy}</td><td bgcolor="#FF0000">${trig}</td></tr>\n`
            } else if (tpy > 0.50) {
                fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td>${yDay}</td><td>${tDay}</td><td bgcolor="#FF0000">${tpy}</td><td>${trig}</td></tr>\n`
            } else {
                fullMail += `<tr><td>${jobName} - ${(i+1)%3 || 3}°</td><td><a href=${hyperLink}>${list[i]}</td><td>${yDay || 'N/A'}</td><td>${tDay || 'N/A'}</td><td>${tpy || 'N/A'}</td><td>${trig}</td></tr>\n`
            }
        }       
    };
    console.log(fullMail);
    return fullMail;
}

async function msgAfterMail (data, email, subjectLine) {
    let projects = data.map(async datum => {
        const res = await parseToMail(datum);
        return res;
    });        
    email += await Promise.all(projects);
    let lines = email.replace(/,<tr>/g,'<tr>').split('\n');
    
    // Alphebetize here
    function sortThings(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
      
        return a > b ? -1 : b > a ? 1 : 0;
    }

    let b = lines.slice(14).sort(sortThings).reverse();
    lines = lines.slice(0, 14).concat(b);
    email = lines.join('\n');

    email += `</table>
    </body></html>`
    const message = {
        from: 'rainbotweather@gmail.com',
        to: 'jwalker@wetlands.com',
        subject: subjectLine,
        text: "Open this email in your browser",
        html: email
    }
    return message;
};


// Message variables
let emailHeader = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<style>
TABLE {border-width: 1px; border-style: solid; border-color: black; border-collapse: collapse;}
TD {border-width: 1px; padding: 3px; border-style: solid; border-color: black;}
</style>
</head><body>`

const WVCron = new cronJob('00 35 */1 */1 * *', function() {
    console.log("WVCron triggered");
    var m = new Date();
    const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    var dateStringFull = `${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()} ${m.getHours()}:${(m.getMinutes().length === 1) ? '0' + m.getMinutes() : m.getMinutes()}`;
    var subjectLine = `West Virginia Rainfall - ${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()}`;

    let email = `
${emailHeader}
<h1>WV RainBot</h1>
<p>The following report was run on ${dateStringFull}</p>
<table>
<colgroup><col/><col/><col/><col/><col/><col/></colgroup>
<tr><th> Job Name </th><th> Station ID </th><th> ${yesterday.getMonth()+1}-${yesterday.getDate()}-${yesterday.getFullYear()} </th><th> ${m.getMonth()+1}-${m.getDate()}-${m.getFullYear()} </th><th> Total Precipitation </th><th> Trigger (in.) </th></tr>
`
    getStations("WV")
        .then(data => {
            message = msgAfterMail(data, email, subjectLine);
                return message;
        })
        .then( message => transporter.sendMail(message, () => console.log("email sent")))
        .catch(err => console.log(err));    
});


const NCCron = new cronJob('00 59 */1 */1 * *', function() {
    console.log("NCCron triggered");
    var m = new Date();
    const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    var dateStringFull = `${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()} ${m.getHours()}:${(m.getMinutes().length === 1) ? '0' + m.getMinutes() : m.getMinutes()}`;
    var subjectLine = `North Carolina Rainfall - ${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()}`;

    let email = `
${emailHeader}
<h1>NC RainBot</h1>
<p>The following report was run on ${dateStringFull}</p>
<table>
<colgroup><col/><col/><col/><col/><col/><col/></colgroup>
<tr><th> Job Name </th><th> Station ID </th><th> ${yesterday.getMonth()+1}-${yesterday.getDate()}-${yesterday.getFullYear()} </th><th> ${m.getMonth()+1}-${m.getDate()}-${m.getFullYear()} </th><th> Total Precipitation </th><th> Trigger (in.) </th></tr>
`
    getStations("NC")
        .then(data => {
            message = msgAfterMail(data, email, subjectLine);
                return message;
        })
        .then( message => transporter.sendMail(message, () => console.log("email sent")))
        .catch(err => console.log(err));    
});

const MVPCron = new cronJob('00 03 06 */1 * *', function() {
    console.log("MVPCron triggered");
    var m = new Date();
    const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    var dateStringFull = `${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()} ${m.getHours()}:${(m.getMinutes().length === 1) ? '0' + m.getMinutes() : m.getMinutes()}`;
    var subjectLine = `MVP Rainfall - ${(m.getMonth()+1)}-${m.getDate()}-${m.getFullYear()}`;

    let email = `
${emailHeader}
<h1>MVP RainBot</h1>
<p>The following report was run on ${dateStringFull}</p>
<table>
<colgroup><col/><col/><col/><col/><col/><col/></colgroup>
<tr><th> Job Name </th><th> Station ID </th><th> ${yesterday.getMonth()+1}-${yesterday.getDate()}-${yesterday.getFullYear()} </th><th> ${m.getMonth()+1}-${m.getDate()}-${m.getFullYear()} </th><th> Total Precipitation </th><th> Trigger (in.) </th></tr>
`
    getStations("MVP")
        .then(data => {
            message = msgAfterMail(data, email, subjectLine);
                return message;
        })
        .then( message => transporter.sendMail(message, () => console.log("email sent")))
        .catch(err => console.log(err));    
});

// WVCron.start();
// NCCron.start();
MVPCron.start();
console.log("Jobs started");