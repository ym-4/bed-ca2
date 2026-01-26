const userCompletionModel = require("../models/userCompletionModel.js");

module.exports.checkChallengeExists = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        details: req.body.details
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkChallengeExists:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Challenge not found"
                });
            }
            else {
                next();
            };
        }
    }

    userCompletionModel.checkChallenge(data, callback);
}

module.exports.checkUserExists = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        details: req.body.details
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserExists:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else {
                next();
            };
        }
    }

    userCompletionModel.checkUser(data, callback);
}

module.exports.checkRecentCompletion = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkRecentCompletion:", error);
            res.status(500).json(error);
        } else {
            if(results.length !== 0) 
            {
                res.status(403).json({
                    message: "You already completed this challenge today!"
                });
            }
            else {
                next();
            };
        }
    }

    userCompletionModel.checkRecent(data, callback);
}

module.exports.checkEquippedPet = (req, res, next) =>
{
    const data = {
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkEquippedPet:", error);
            res.status(500).json(error);
        } else {
            req.equippedPetId = results[0] ? results[0].equipped_pet_id : null;
            next();
        }
    }

    userCompletionModel.checkEquippedPet(data, callback);
}

module.exports.updateUserPoints = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        details: req.body.details
    }
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updateUserPoints:", error);
                res.status(500).json(error);
            
                if (results.length == 0) {
                    res.status(404).json({
                        message: "User not found"
                    });
                }   
            } else {
                res.statusCode = 200;
                next();
            }
        }

         userCompletionModel.updateUserPoints(data, callback);
}

module.exports.awardPetXP = (req, res, next) =>
{
    if (!req.equippedPetId) {
        // No equipped pet, skip XP award
        next();
        return;
    }

    const data = {
        challenge_id: req.params.id,
        pet_id: req.equippedPetId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error awardPetXP:", error);
            req.xpAwardError = error.message;
        } else {
            req.xpAwardResult = results;
        }
        next();
    }

    userCompletionModel.awardPetXP(data, callback);
}

module.exports.checkPetLevelUp = (req, res, next) =>
{
    if (!req.equippedPetId) {
        next();
        return;
    }

    const data = {
        pet_id: req.equippedPetId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkPetLevelUp:", error);
            req.levelCheckError = error.message;
        } else {
            req.levelCheckResult = results;
        }
        next();
    }

    userCompletionModel.checkPetLevelUp(data, callback);
}

module.exports.createCompletion = (req, res, next) =>
{
    if(req.body.user_id == undefined || req.body.details == undefined)
    {
        res.status(400).send("Error: user_id or details is undefined");
        return;
    }

    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        details: req.body.details
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createCompletion:", error);
            res.status(500).json(error);
        } else {
            req.params.id = results.insertId;
            res.statusCode = 201;
            next();
        }
    }

    userCompletionModel.insertSingle(data, callback);
}

module.exports.readCompletionById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCompletionById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Completion not found"
                });
            }
            else res.status(201).json(results[0]);
        }
    }

    userCompletionModel.selectById(data, callback);
}

module.exports.readCompletionByChallenge = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCompletionByChallenge:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Challenge does not have any user attempts"
                });
            }
            else res.status(200).json(results);
        }
    }

    userCompletionModel.selectByChallenge(data, callback);
}