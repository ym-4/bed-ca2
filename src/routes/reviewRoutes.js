const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.readAllReview);

router.post('/', reviewController.checkRecentReview,
                reviewController.createReview,
                reviewController.readReviewById);

router.get('/:id', reviewController.readReviewById);

router.put('/:id', reviewController.checkOwnerById,
                    reviewController.updateReviewById,
                    reviewController.readReviewById);

router.delete('/:id', reviewController.deleteReviewById);


module.exports = router;