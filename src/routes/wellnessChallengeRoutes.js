const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

router.get('/', wellnessChallengeController.readAllChallenge);

// create new challenge
router.post('/', wellnessChallengeController.createNewChallenge, 
                wellnessChallengeController.readChallengeById);

router.put('/:id', userCompletionController.checkChallengeExists,
                    wellnessChallengeController.checkOwnerById,
                    wellnessChallengeController.updateChallengeById, 
                    wellnessChallengeController.readChallengeById);

router.delete('/:id', wellnessChallengeController.deleteChallengeById,
                    wellnessChallengeController.deleteCompletionsById);

// get challenges created by user
router.get('/creator/:userId', wellnessChallengeController.readChallengeCreator);

module.exports = router;