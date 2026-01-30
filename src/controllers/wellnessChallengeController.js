const wellnessChallengeModel = require("../models/wellnessChallengeModel.js");

module.exports.readAllChallenge = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllChallenge:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    wellnessChallengeModel.selectAll(callback);
}

module.exports.readChallengeById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Challenge not found"
                });
            }
            else res.status(res.statusCode).json(results[0]);
        }
    }

    wellnessChallengeModel.selectById(data, callback);
}

module.exports.createNewChallenge = (req, res, next) =>
{
    if(req.body.description == undefined || req.body.user_id == undefined || req.body.points == undefined)
    {
        res.status(400).send("Error: description or user_id or points is undefined");
        return;
    }

    const data = {
        description: req.body.description,
        user_id: req.body.user_id,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewChallenge:", error);
            res.status(500).json(error);
        } else {
            //res.status(201).json(results);
            req.params.id = results.insertId;
            res.statusCode = 201;
            next();
        }
    }

    wellnessChallengeModel.insertSingle(data, callback);
}

module.exports.updateChallengeById = (req, res, next) =>
{
    if(req.body.user_id == undefined || req.body.description == undefined || req.body.points == undefined)
    {
        res.status(400).json({
            message: "Error: user_id or description or points is undefined"
        });
        return;
    }
    const data = {
        id: req.params.id,
        user_id: req.body.user_id,
        description: req.body.description,
        points: req.body.points
    }
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updateChallengeById:", error);
                res.status(500).json(error);
            } else {
                res.statusCode = 200;
                next();
            }
        }

        wellnessChallengeModel.updateById(data, callback);
}

module.exports.checkOwnerById = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkOwnerById:", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(403).json({
                    message: "Not correct owner"
                });
            } else {
                next();
            }
        }
    }

    wellnessChallengeModel.checkOwner(data, callback);
}

module.exports.deleteChallengeById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Challenge not found"
                });
            } else {
                next();
            }           
        }
    }

    wellnessChallengeModel.deleteById(data, callback);
}

module.exports.deleteCompletionsById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Challenge not found"
                });
            }
            else res.status(204).send();          
        }
    }

    wellnessChallengeModel.deleteCompletionById(data, callback);
}
