import express = require('express');
import path = require('path');
import https = require("https");
import fs = require('fs');
import crypto = require("crypto");
import querystring = require('querystring');
import cookieParser = require('cookie-parser');
import OAuth = require('oauth');
const fetch = require('node-fetch');

const progQuotesUrl = 'https://programming-quotes-api.herokuapp.com/';
const loginUri = 'https://accounts.spotify.com/authorize?';
const baseAuthUri = 'https://accounts.spotify.com/';
const spotifyApiUrl = "https://api.spotify.com";
const redirectUri = 'http://localhost:3000/callback';

// Create a new express app instance
const app: express.Application = express();

let clientSecret: string;
let clientId: string;
let accessToken: string;
const stateKey = 'spotify_auth_state';

app.use(express.static('client'))
   .use(cookieParser());

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get('/isLoggedIn', (req: express.Request, res: express.Response) => {
    const response = {
        isLoggedIn: (accessToken !== undefined)
    };
    res.status(200);
    res.setHeader('Content-type', 'text/json');
    res.send(JSON.stringify(response));
});

app.get('/login', (req: express.Request, res: express.Response) => {
    const state = crypto.randomBytes(8).toString('hex');
    res.cookie(stateKey, state);
  
    const scope = 'user-read-private user-read-email';
    res.redirect(loginUri +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,  
        state: state
      })
    );
});

app.get('/callback',  (req: express.Request, res: express.Response) => {
    authorize(<string>req.query.code, true, () => {
        res.sendFile(path.join(__dirname + '/../client/index.html'));
    });
});

app.get('/authNoLogin',  (req: express.Request, res: express.Response) => {
    authorize('', false, () => {
        res.sendFile(path.join(__dirname + '/../client/index.html'));
    });
});

function authorize(code: string, isAuthCode: boolean, callback: () => void) {
    const grantType = isAuthCode ? 'authorization_code' : 'client_credentials';
    const oauth2 = new OAuth.OAuth2(
        clientId,
        clientSecret, 
        baseAuthUri, 
        undefined,
        'api/token', 
        undefined
    );
    oauth2.getOAuthAccessToken(
        code,
        {
           'grant_type': grantType,
           'redirect_uri': redirectUri
        },
        (e, access_token, refresh_token, results) => {
            accessToken = access_token;
            console.log(accessToken, refresh_token, results);
            callback();
        }
     );
}

app.get('/artistSearch', async (req: express.Request, res: express.Response) => {
    const response = await fetch(spotifyApiUrl + '/v1/search?type=artist&q=' + req.query.q, {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + accessToken}
    });
    const data = await response.json();

    res.status(200);
    res.setHeader('Content-type', 'text/json');
    res.send(JSON.stringify(data));
});

app.get('/items', (req: express.Request, res: express.Response) => {  
    const url = progQuotesUrl + "quotes";
    
    https.get(url, (res2: any) => {
        let data = "";
        res2.on('data', (chunk: any) => {
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
    fs.readFile('client-info.json', 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        const jsonData = JSON.parse(data);
        clientId = jsonData['client_id'];
        clientSecret = jsonData.client_secret;
    });
    console.log('App is listening on port 3000!');
});
