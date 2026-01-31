const express = require('express');
const router = express.Router();

const userPetsController = require('../controllers/userPetsController');

router.get('/pets', userPetsController.readAllPets);
router.get('/breeds', userPetsController.readAllPetbreeds);

router.get('/users/:id/pets', userPetsController.readPetsByUser); // view a user's pets
router.get('/breeds/:id', userPetsController.readBreedsById); 

router.get('/abilities', userPetsController.readAllAbilities); // pet abilities catalogue

// to equip a specific pet
router.put('/users/:userId/equip-pet/:userPetId', 
            userPetsController.checkOwnership, // check pet ownership
            userPetsController.checkIfPetEquipped, // unequip pet first to proceed
            userPetsController.equipPet);

// to unequip a pet
router.put('/users/:userId/unequip-pet',
            userPetsController.checkIfPetCanBeUnequipped, // Check if a pet is equipped
            userPetsController.unequipPet);

// adopt pet by xp
router.post('/users/:userId/adopt/pets/:breedId', 
                    // check if user already owns breed
                userPetsController.checkDupe,
                    // check adoption eligibility by points
                userPetsController.checkUserXP,
                    // adopts new pet                          
                userPetsController.adoptNewPet,
                    // deducts users points by pet breed                       
                userPetsController.updateUserPoints);

// edit pet info
router.put('/users/:userId/pets/:userPetId', 
                    // check exist
                    userPetsController.readUserPetId,
                    // check if user owns breed
                    userPetsController.checkOwnership, 
                    // edit pet details
                    userPetsController.updatePetInfo);

// unlock abilities by pet level
router.post('/users/:userId/unlock/pets/:userPetId/ability/:abilityId', 
                    // check user owns pet
                userPetsController.checkOwnership,
                    // check level eligibility to unlock 
                userPetsController.checkUserPetsLevel,
                    // check if user already owns ability
                userPetsController.checkAbility,
                //     // unlocked new                         
                userPetsController.unlockAbility,
                );

// get pet by user_pet_id
router.get('/pets/:userPetId', userPetsController.readUserPetId2);

// user get their pet's unlocked abilities
router.get('/pets/:userPetId/abilities', userPetsController.readPetAbilities);

// leaderboard
router.get('/leaderboard', userPetsController.readTop5Users);

// pet of the day
router.get('/top-pet', userPetsController.readTopPet);

module.exports = router;