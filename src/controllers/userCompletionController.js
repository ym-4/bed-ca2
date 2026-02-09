const userCompletionModel = require("../models/userCompletionModel.js");

module.exports.checkChallengeExists = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        description: req.body.description
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
                    message: "Please sign in to view task completions"
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
                res.status(409).json({
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

// check for power bonus activation
module.exports.calculatePowerBonus = (req, res, next) =>
{
    const data = {
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error calculatePowerBonus:", error);
            req.powerMultiplier = 1.00;
        } else {
            // Map ability_id to multiplier
            const abilityMultiplierMap = {
                1: 1.10, // Purrfect Purin Heal - 10%
                2: 1.30, // Sprint Snack Boost - 30%
                3: 1.50, // Shell Melonpan Sanctuary - 50%
                4: 1.70, // Backflip Dango Burst - 70%
                5: 1.90  // Universal Cheer Taiyaki - 90%
            };
            
            const highestAbility = results[0]?.highest_ability_id;
            req.powerMultiplier = abilityMultiplierMap[highestAbility] || 1.00;
            
            if (req.powerMultiplier > 1.00) {
                req.powerBonusApplied = true;
            }
        }
        next();
    }

    userCompletionModel.getEquippedPetBonus(data, callback);
}


module.exports.applyPowerBonusToPoints = (req, res, next) => 
{
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        multiplier: req.powerMultiplier || 1.00
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error applyPowerBonusToPoints:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            } else {
                res.statusCode = 200;
                next();
            }
        }
    }

    userCompletionModel.updatePointsWithBonus(data, callback);
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
            if (results.leveledUp) {
                req.levelUpStatus = "success";
                req.levelUpMessage = `Your pet leveled up from ${results.oldLevel} to ${results.newLevel}!`;
            }
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
            else {
                const response = results[0];
                if (req.levelUpMessage) {
                    response.levelUpMessage = req.levelUpMessage;
                    response.leveledUp = true;
                }
                if (req.powerBonusApplied) {
                    response.powerBonus = {
                        multiplier: req.powerMultiplier,
                        bonusPercent: Math.round((req.powerMultiplier - 1) * 100),
                        message: `Power bonus activated! +${Math.round((req.powerMultiplier - 1) * 100)}% points`
                    };
                }
                res.status(201).json(results[0]);
            }
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

module.exports.readCompletionByUser = (req, res, next) =>
{
    const data = {
        userId: req.params.userId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCompletionByUser:", error);
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

    userCompletionModel.selectByUser(data, callback);
}

module.exports.updateDetails = (req, res, next) =>
{
    if(req.params.id == undefined || req.body.details == undefined)
    {
        res.status(404).json({
            message: "completion or details is undefined"
        });
        return;
    }
    const data = {
        id: req.params.id,
        details: req.body.details
    }
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updateDetails:", error);
                res.status(500).json(error);
            } 
                if(!results || results.affectedRows === 0) {
                    res.status(404).json({
                        message: "Completion not found"
                    });
                } else {
                res.status(200).json({
                    message: "Comment successfully changed!"
                });
            }
        }

        userCompletionModel.updateDetail(data, callback);
}

module.exports.getUserPowerBonus = (req, res, next) =>
{
    const data = {
        user_id: req.params.userId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserPowerBonus:", error);
            res.status(500).json(error);
        } else {
            const abilityMultiplierMap = {
                1: 1.10,
                2: 1.30, 
                3: 1.50,
                4: 1.70,
                5: 1.90
            };
            
            const highestAbility = results[0]?.highest_ability_id;
            const multiplier = abilityMultiplierMap[highestAbility] || 1.00;
            
            res.status(200).json({
                highest_ability_id: highestAbility,
                multiplier: multiplier,
                bonus_percent: Math.round((multiplier - 1) * 100),
                has_bonus: multiplier > 1.00
            });
        }
    }

    userCompletionModel.getEquippedPetBonus(data, callback);
}