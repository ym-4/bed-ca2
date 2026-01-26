const express = require('express');
const router = express.Router();

const wellnessChallengeController = require('../controllers/wellnessChallengeController');
const userCompletionController = require('../controllers/userCompletionController');

router.get('/', wellnessChallengeController.readAllChallenge);
router.post('/', wellnessChallengeController.createNewChallenge, 
                wellnessChallengeController.readChallengeById);

router.put('/:id', userCompletionController.checkChallengeExists,
                    wellnessChallengeController.checkOwnerById,
                    wellnessChallengeController.updateChallengeById, 
                    wellnessChallengeController.readChallengeById);

router.delete('/:id', wellnessChallengeController.deleteChallengeById,
                    wellnessChallengeController.deleteCompletionsById);

module.exports = router;