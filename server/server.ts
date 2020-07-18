import express = require('express');
import path = require('path');
import https = require("https");

const progQuotesUrl = "https://programming-quotes-api.herokuapp.com/";

// Create a new express app instance
const app: express.Application = express();

app.use(express.static('client'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get('/items', (req: express.Request, res: express.Response) => {  
    const url = progQuotesUrl + "quotes";
    
    https.get(url, (res2) => {
        let data = "";
        res2.on('data', (chunk) => {
            data += chunk;
        });
        res2.on('end', () => {
            let json = JSON.parse(data);
            console.log('json', json);
            json = json.sort((item1: any, item2: any) => {
                if (item1.author > item2.author) return 1;
                if (item2.author > item1.author) return -1;
                return 0;
            });
            res.status(200);
            res.setHeader('Content-type', 'text/json');
            res.send(JSON.stringify(json));
        });
    });
});
  

app.listen(3000, () => {
    console.log('App is listening on port 3000!');
});