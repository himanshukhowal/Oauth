var express = require('express');
var router = express.Router();
var fs = require('fs');
var mime = require('mime');
var request = require('request');

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

router.post('/fileUpload', (req, res) => {
    uploadFile(req.body, (uploadedPayload) => {
        if(uploadedPayload.code != 200)
            res.status(uploadedPayload.code).json(uploadedPayload);
        else
            res.json(uploadedPayload);
    });
})
    

function uploadFile(body, callback)
{
    validateRequestPostCode(body, (validBody) => {
        request.post({
            url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            form: {
                redirect_uri: body.callbackURL,
                client_id: body.clientId,
                client_secret: body.clientSecret,
                code: body.token,
                grant_type: 'authorization_code'
            },
        }, function(error, response, responseBody) {

            const buf = new Buffer.from(body.fileData, "base64");

            request.put({
                url: 'https://graph.microsoft.com/v1.0/drive/root:/test/' + body.fileName + ':/content',
                headers: {
                    'Authorization': "Bearer " + JSON.parse(responseBody).access_token,
                    'Content-Type': mime.lookup(body.fileName),
                },
                body: buf,
            }, function(er, re, bo) {
                console.log(bo);
                callback({code:200, message: [JSON.parse(bo)]});
            });
        });
    });
}

function generateAuthUrl(body, callback)
{
    callback({
        code: 200,
        message: ['Authentication URL generated'],
        authenticationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' + body.clientId +'&scope=files.readwrite offline_access&response_type=code&redirect_uri=' + body.callbackURL
    })
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