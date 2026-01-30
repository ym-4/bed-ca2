const userPetsModel = require("../models/userPetsModel.js");

module.exports.readAllPets = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllPets:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userPetsModel.selectAll(callback);
}

module.exports.readPetsByUser = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readPetsByUser:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    userPetsModel.selectById(data, callback);
}


module.exports.checkUserXP = (req, res, next) =>
{
    const data = {
        userId: req.params.userId,
        breedId: req.params.breedId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserXP:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User or pet not found"
                });
            } else if (results[0].points < results[0].required_points) {
                res.status(403).json({
                    message: "Not enough points, complete more challenges to adopt!"
                });
            } else {
                next();
            }
        }
    }

    userPetsModel.checkXP(data, callback);
}

module.exports.checkDupe = (req, res, next) =>
{
    const data = {
        userId: req.params.userId,
        breedId: req.params.breedId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkDupe:", error);
            res.status(500).json(error);
        } else {
            if(results.length > 0) 
            {
                res.status(409).json({
                    message: "Pet already adopted"
                });
            } else {
                next();
            }
        }
    }

    userPetsModel.checkForDupes(data, callback);
}

module.exports.adoptNewPet = (req, res, next) =>
{
    if(req.body.pet_name == undefined)
    {
        res.status(400).send("Error: Pet_name is undefined");
        return;
    }

    const data = {
        userId: req.params.userId,
        breedId: req.params.breedId,
        pet_name: req.body.pet_name,
        pet_level: 0,
        experience_points: 0
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error adoptNewPet:", error);
            res.status(500).json(error);
        } else {
            next();
        }
    }

    userPetsModel.insertSingle(data, callback);
}

module.exports.updateUserPoints = (req, res, next) =>
{
    const data = {
        userId: req.params.userId,
        breedId: req.params.breedId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserPoints:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "User or pet not found"
                });
            } else {
                res.status(201).json({
                    message: "Successfully adopted new pet!"
                });
            }
        }
    }

    userPetsModel.updatePoints(data, callback);
}


module.exports.readAllPetbreeds = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllPetbreeds:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userPetsModel.selectAllBreeds(callback);
}

module.exports.readBreedsById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readBreedsById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Pet breeds not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    userPetsModel.selectBreedById(data, callback);
}


module.exports.readUserPetId = (req, res, next) =>
{
    const data = {
        userPetId: req.params.userPetId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserPetId:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User pets not found"
                });
            }
            else {
                next();
            }
        }
    }

    userPetsModel.readUserPets(data, callback);
}

module.exports.checkOwnership = (req, res, next) =>
{
    const data = {
        userId: req.params.userId,
        userPetId: req.params.userPetId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkOwnership:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(403).json({
                    message: "Pet does not belong to user"
                });
            }
            else {
                // res.status(200).json(results);
                next();
            }
        }
    }

    userPetsModel.selectByUserPetId(data, callback);
}

module.exports.updatePetInfo = (req, res, next) =>
{
    if(req.body.pet_name == undefined)
    {
        res.status(400).json({
            message: "Error: pet_name is undefined"
        });
        return;
    }

    const data = {
        userId: req.params.userId,
        userPetId: req.params.userPetId,
        pet_name: req.body.pet_name,
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updatePetInfo:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Pet not found."
                });
            }
            else res.status(200).json({
                message: `Pet successfully renamed to ${data.pet_name}`
            }); 
        }
    }

    userPetsModel.updatePet(data, callback);
}


module.exports.readAllAbilities = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllAbilities:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userPetsModel.selectAllAbilities(callback);
}

module.exports.checkIfPetEquipped = (req, res, next) =>
{
    const data = {
        user_id: req.params.userId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkIfPetEquipped:", error);
            res.status(500).json({
                error: error.message
            });
        } else {
            if (results.length > 0 && results[0].equipped_pet_id) {
                // User already has a pet equipped
                res.status(409).json({
                    message: "User already has a pet equipped",
                    equipped_pet_id: results[0].equipped_pet_id,
                    pet_name: results[0].pet_name
                });
            } else {
                // No pet equipped
                next();
            }
        }
    }

    userPetsModel.checkIfPetEquipped(data, callback);
}

module.exports.equipPet = (req, res, next) =>
{
    const data = {
        user_id: req.params.userId,
        pet_id: req.params.petId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error equipPet:", error);
            res.status(500).json({
                error: error.message
            });
        } else {
            res.status(200).json({
                message: "Pet equipped successfully",
                user_id: data.user_id,
                equipped_pet_id: data.pet_id
            });
        }
    }

    userPetsModel.equipPet(data, callback);
}


module.exports.checkIfPetCanBeUnequipped = (req, res, next) =>
{
    const data = {
        user_id: req.params.userId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkIfPetCanBeUnequipped:", error);
            res.status(500).json({
                error: error.message
            });
        } else {
            if (results.length === 0 || !results[0].equipped_pet_id) {
                // User doesn't have a pet equipped
                res.status(404).json({
                    message: "No pet equipped"
                });
            } else {
                next();
            }
        }
    }

    userPetsModel.checkIfPetEquipped(data, callback);
}

module.exports.unequipPet = (req, res, next) =>
{
    const data = {
        user_id: req.params.userId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error unequipPet:", error);
            res.status(500).json({
                error: error.message
            });
        } else {
            res.status(200).json({
                message: "Pet unequipped successfully",
                user_id: data.user_id
            });
        }
    }

    userPetsModel.unequipPet(data, callback);
}


module.exports.checkUserPetsLevel = (req, res, next) =>
{
    const data = {
        userId: req.params.userId,
        userPetId: req.params.userPetId,
        abilityId: req.params.abilityId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserPetsLevel:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User or pet or ability not found"
                });
            } else if (results[0].pet_level < results[0].required_level) {
                res.status(403).json({
                    message: "Your pet’s level is too low. Level up to unlock this ability!"
                });
            } else {
                next();
            }
        }
    }

    userPetsModel.checkLevel(data, callback);
}

module.exports.checkAbility = (req, res, next) =>
{
    const data = {
        userPetId: req.params.userPetId,
        abilityId: req.params.abilityId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkAbility:", error);
            res.status(500).json(error);
        } else {
            if(results.length !== 0) 
            {
                res.status(403).json({
                    message: "Your pet already unlocked this ability!"
                });
            } else {
                next();
            }
        }
    }

    userPetsModel.checkOwnAbility(data, callback);
}

module.exports.unlockAbility = (req, res, next) =>
{
    if(req.params.userPetId == undefined || req.params.abilityId == undefined)
    {
        res.status(400).send("Error: userPetId or abilityId is undefined");
        return;
    }

    const data = {
        userPetId: req.params.userPetId,
        abilityId: req.params.abilityId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error unlockAbility:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                Message: "New pet ability unlocked successfully!",
                unlockedAbilityId: results.insertId
            });
        }
    }

    userPetsModel.unlockNewAbility(data, callback);
}

module.exports.readPetAbilities = (req, res, next) =>
{
    const data = {
        userPetId: req.params.userPetId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readPetAbilities:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "No pet abilities found"
                });
            }
            else res.status(200).json(results);
        }
    }

    userPetsModel.selectAllAbilitiesById(data, callback);
}


module.exports.readTop5Users = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readTop5Users:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userPetsModel.selectTop5(callback);
}

module.exports.readTopPet = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readTopPet:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results[0]);
    }

    userPetsModel.selectTopPet(callback);
}