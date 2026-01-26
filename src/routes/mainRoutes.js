const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const wellnessChallengeRoutes = require('./wellnessChallengeRoutes');
const userCompletionRoutes = require('./userCompletionRoutes')
const userPetsRoutes = require('./userPetsRoutes');

const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const userController = require('../controllers/userController');

router.use("/users", userRoutes);
router.use("/challenges", wellnessChallengeRoutes);
router.use("/challenges/", userCompletionRoutes);
router.use("/", userPetsRoutes);

router.post("/login", 
    userController.login, 
    bcryptMiddleware.comparePassword, 
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);

router.post("/register", 
    userController.checkUsernameOrEmailExist, 
    bcryptMiddleware.hashPassword, 
    userController.register, 
    jwtMiddleware.generateToken, 
    jwtMiddleware.sendToken);

module.exports = router;