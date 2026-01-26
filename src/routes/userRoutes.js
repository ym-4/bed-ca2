const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
// const playerController = require('../controllers/playerController');
// const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/', userController.readAllUser);

router.post('/', userController.createNewUser, 
                userController.readUserById);

router.get('/:id', userController.readUserById);

router.put('/:id', userController.updateUserById, 
                    userController.readUserById);

router.delete('/:id', userController.deleteUserById);


module.exports = router;