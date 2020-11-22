var express = require('express');
var router = express.Router();
const fs = require('fs');
const {google} = require('googleapis');
const stream = require("stream");

const SCOPES = ['https://www.googleapis.com/auth/drive'];

router.use('/', (req, res) => {
    validateRequest(req.body, (validBody) => {
        if(validBody.code != 200)
            res.status(validBody.code).json(validBody);
        else
            req.next();
    })
})

router.post('/authenticate', (req, res) => {
    generateAuthUrl(req.body, (generatedUrl) => {
        if(generatedUrl.code != 200)
            res.status(generatedUrl.code).json(generatedUrl);
        else
            res.json(generatedUrl);
    })
})

router.post('/uploadFile', (req, res) => {
    fileUpload(req.body, (validBody) => {
        if(validBody.code != 200)
            res.status(validBody.code).json(validBody);
        else
            res.json(validBody);
    })
})

function fileUpload(body, callback)
{
    validateRequestPostCode(body, (validBody) => {
        if(validBody.code == 200)
        {
            try
            {
                const oAuth2Client = new google.auth.OAuth2(body.clientId, body.clientSecret, body.callbackURL);
                oAuth2Client.getToken(body.token, (err, token) => {
                    oAuth2Client.setCredentials(token);
                    const drive = google.drive({version: 'v3'});

                    const buf = new Buffer.from(body.fileData, "base64");
                    const bs = new stream.PassThrough();
                    bs.end(buf);

                    var fileMetadata = {
                        'name': body.fileName,
                    };
                    var media = {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        body: bs
                    };
                    drive.files.create({
                        auth: oAuth2Client,
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    }, function (err, file) {
                    if (err) {
                        // Handle error
                        console.error(err);
                        validBody.code = 400;
                        validBody.message.push(err.toString());
                        callback(validBody);
                    } else {
                        console.log('File Id:', file.id);
                        validBody.message.push('File has been uploaded successfully');
                        callback(validBody);
                    }
                    });
                });
            }
            catch(e)
            {
                validBody.code = 400;
                validBody.message.push(e.toString());
                callback(validBody);
            }
        }
        else
        {
            callback(validBody);
        }
    });
}

function generateAuthUrl(body, callback)
{
    var response = {
        code: 200,
        message: []
    };
    try
    {
        const oAuth2Client = new google.auth.OAuth2(body.clientId, body.clientSecret, body.callbackURL);
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        response.message.push('Authentication URL generated');
        response.authenticationUrl = authUrl;
    }
    catch(e)
    {
        response.code = 400;
        response.message.push(e.toString());
    }

    callback(response);
}

function validateRequestPostCode(body, callback)
{
    validateRequest(body, (validBody) => {
        if(!body.token)
        {
            validBody.code = 400;
            validBody.message.push('The authorization token is missing from the payload');
        }
        if(!body.fileName)
        {
            validBody.code = 400;
            validBody.message.push('The filename is missing from the payload');
        }
        if(!body.fileData)
        {
            validBody.code = 400;
            validBody.message.push('File data in missing from the payload');
        }
        callback(validBody);
    })
}

function validateRequest(body, callback)
{
    var response = {
        code: 200,
        message: []
    };
    if(!body.clientId)
    {
        response.code = 400;
        response.message.push('Client id is not available in the payload');
    }

    if(!body.clientSecret)
    {
        response.code = 400;
        response.message.push('Client secret is not available in the payload');
    }

    if(!body.callbackURL)
    {
        response.code = 400;
        response.message.push('Callback URL is not available in the payload');
    }

    callback(response);
}

module.exports = router;