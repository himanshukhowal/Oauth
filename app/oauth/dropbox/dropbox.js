var express = require('express');
var router = express.Router();
var stream = require("stream");
var dropboxV2Api = require('dropbox-v2-api');

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
                const dropbox = dropboxV2Api.authenticate({
                    client_id: body.clientId,
                    client_secret: body.clientSecret,
                    redirect_uri: body.callbackURL,
                });
                dropbox.getToken(body.token, async (err, result, response) => {
                    if(!err) 
                    {
                        const buf = new Buffer.from(body.fileData, "base64");
                        const bs = new stream.PassThrough();
                        bs.end(buf);
                        dropbox({
                            resource: 'files/upload',
                            parameters: {
                                path: body.fileName
                            },
                            readStream: bs
                        }, (err, result, response) => {
                            callback({code:200, message:['file uploaded']});
                        });
                    }
                    else
                    {
                        callback({code:400, message: [err]});
                    }
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
        const dropbox = dropboxV2Api.authenticate({
            client_id: body.clientId,
            client_secret: body.clientSecret,
            redirect_uri: body.callbackURL,
        });
        const authUrl = dropbox.generateAuthUrl();
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