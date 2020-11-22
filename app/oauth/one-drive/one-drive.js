var express = require('express');
var router = express.Router();
var fs = require('fs');
var mime = require('mime');
var request = require('request');

var file = 'D:/1.xlsx'; // Filename you want to upload on your local PC
var onedrive_folder = 'SampleFolder'; // Folder name on OneDrive
var onedrive_filename = '1.xlsx'; // Filename on OneDrive

router.post('/authenticate', (req, res) => {
        fs.readFile(file, function read(e, f) {
            request.put({
                url: 'https://graph.microsoft.com/v1.0/drive/root:/' + onedrive_folder + '/' + onedrive_filename + ':/content',
                headers: {
                    'Authorization': "Bearer EwBoA8l6BAAU6k7+XVQzkGyMv7VHB/h4cHbJYRAAAaDASTv9QRAKlv5Sj4PTCT9TlEXvXnSYpe1MzTkAmnTN+Fm7+2qX8oBuiD4I7Q7Zhuya6nSPYSWfSmzkA7mXcMbV+F1nATKMc16TgVc6N5npknpDteFIAwdHGYiCvz4nvV7ze66HxDFex0NJ9bZ7PTh4RHt/Sqaq42g0TP1moENbDZXgMi+Eryd8cGbEVwj4zaLjegRb4UvcUe7iuexABENjTZ7llDbXCEtwiYPAcDzpcxRcg5sjb+U9d3jZsPM+Uu81dKY0d7cvlzzJ+z8lAnD/Gvu5O6oU6bCSdVOhSKDf+l12igUbUKxLOVc23L8u1dDcN59ERqO4qjdcbVy+WTUDZgAACLuAMeawyBF7OAJ8tUQwsBVAfdOUJwjME8V01ShP19lWDlCwgJT3WoEF/zu/d2YT7+roKZRB12jFqX6je4GPA/X/4qlVoEFmiCgral3dEl+e524VpvTxpYVUItYOKKz95QoMKtV2x5JZvqQ07lLZJrwufkY0PowFb8yuhmWeR6hKM1uNKom931wFbvqI6Rs1QErwMOat7FDJ3dLF3GIMB8AGzPTmLPnX5/kLOhvA6hI0FuGXHTOY23DcB81WWiBG5SX1OU+R9SahjjVdyEe2Wt4RkOOR6YUiXHqUV+x0+XlV3aFYBmS2TkLmW8IygJTBH+eLBH31nQ2VNxN5lHXmnbPdVYoFSVMcsnkMrx2m3DQopuN2fkJYq42mubkERjVnr8UtJfrqKPbvg+ChOHk6cHMlL1bnEKiSdOPVr1NHy9j24b6xHyURekiJkKNKarp1qZLPlBZbXafSJTBvEu8xDbnkV2zVGb5Th0479CKskhP3s4Uydz+h6JvPjFXNqZ5FVle3vc2WjkyLAIxcEGXJZmeu3RA6abZWgjjQcIhIW0KRF/tzivLq3xt6N6jGaVFVkw5Dmwf6gUVLswAINWm0OR8HAUMgGub2aq36/x51E/ul0xo5RWV/DSI7TRruaYEGVbH4/LQiK/0yfjNGSgGmi9suVuwSNsiXCFQvQ8kup4L1tpoLI0B0pC8dS4iqbhjbgmAPrWjhi1PqASNHrBcJvpvljsCCkJacOa8tI1JxHhuMnBHPtWcCI7rphlEytPnUbqLsfgI=",
                    'Content-Type': mime.lookup(file), // When you use old version, please modify this to "mime.lookup(file)",
                },
                body: f,
            }, function(er, re, bo) {
                console.log(bo);
            });
        });
    res.json({"code":200});
})


module.exports = router;