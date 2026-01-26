const express = require('express');
const router = express.Router({ mergeParams: true });

const userCompletionController = require('../controllers/userCompletionController');

router.post('/:id', userCompletionController.checkChallengeExists,
                    userCompletionController.checkUserExists,
                    userCompletionController.checkRecentCompletion,
                    userCompletionController.checkEquippedPet, 
                    userCompletionController.updateUserPoints,
                    // xp distributed for equipped pet only
                    userCompletionController.awardPetXP, 
                    // pet levels up if eligible
                    userCompletionController.checkPetLevelUp, 
                    userCompletionController.createCompletion,  
                    userCompletionController.readCompletionById);

router.get('/:id', userCompletionController.readCompletionByChallenge);

module.exports = router;