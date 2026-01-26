const userModel = require("../models/userModel.js");

module.exports.readAllUser = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllUser:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userModel.selectAll(callback);
}

module.exports.readUserById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(res.statusCode).json(results[0]);
        }
    }

    userModel.selectById(data, callback);
}

module.exports.createNewUser = (req, res, next) =>
{
    if(req.body.username == undefined)
    {
        res.status(400).send("Error: Username is undefined");
        return;
    }

    const data = {
        username: req.body.username
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewUser:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({
                    message: "Username already exists"
                });
            } else {
            res.status(500).json(error);
            }
        } else {
           // res.status(201).json(results);
            req.params.id = results.insertId;
            res.statusCode = 201;
            next();
        }
    }

    userModel.insertSingle(data, callback);
}

module.exports.updateUserById = (req, res, next) =>
{
    if(req.body.username == undefined || req.body.points == undefined)
    {
        res.status(400).json({
            message: "Error: username or points is undefined"
        });
        return;
    }

    const data = {
        id: req.params.id,
        username: req.body.username,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserById:", error);

            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({
                    message: "Username already exists"
                });
            } else {
            res.status(500).json(error);
            }
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

    userModel.updateById(data, callback);
}

module.exports.deleteUserById = (req, res, next) =>
{
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(204).send(); // 204 No Content            
        }
    }

userModel.deleteById(data, callback);
}

//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
    try { 
        const requiredFields = ['username', 'password'];

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === "") {
                res.status(400).json({ message: `${field} is undefined or empty` });
                return;
            }
        };

        const data = {
            username: req.body.username,
            password: res.locals.hash
        };

        const callback = (error, results) => {
            if(error){
                console.error("Error login callback: ", error);
                res.status(500).json(error);
            } else {
                if(results.length == 0){
                    res.status(404).json({message: "User not found"}); 
                } else {
                    res.locals.userId = results[0].id
                    res.locals.hash = results[0].password
                    next();
                }
            }
        };

        userModel.login(data, callback);

    } catch (error) {
        console.error("Error login: ", error);
        res.status(500).json(error);
    }
};

//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    try {
        const requiredFields = ['username', 'email'];

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === "") {
                res.status(400).json({ message: `${field} is undefined or empty` });
                return;
            }
        };
    
        const data = {
            email: req.body.email,
            username: req.body.username
        };

        const callback = (error, results) => {
            if(error){
                console.error("Error readUserByEmailAndUsername callback: ", error);
                res.status(500).json(error);
            } else {
                if(results[1].length != 0 || results[0].length != 0){
                    res.status(409).json({message: "Username or email already exists"});
                } else {
                    next();
                }
            }
        };

        userModel.readUserByEmailAndUsername(data, callback);

    } catch (error) {
        console.error("Error readUserByEmailAndUsername: ", error);
        res.status(500).json(error);
    }

};

module.exports.register = (req, res, next) => {
        try { 
            const data = {
                email: req.body.email,
                username: req.body.username,
                password: res.locals.hash
            };
    
            const callback = (error, results) => {
                if(error){
                    console.error("Error register callback: ", error);
                    res.status(500).json(error);
                } else {
                    res.locals.userId = results.insertId;
                    next();
                }
            };
    
            userModel.register(data, callback);
    
        } catch (error) {
            console.error("Error register: ", error);
            res.status(500).json(error);
        }
};