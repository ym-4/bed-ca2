const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM user;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT * FROM user
    WHERE user_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.insertSingle = (data, callback) =>
{
  const SQLSTATMENT = `
    INSERT INTO user (username)
    VALUES (?);
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATMENT, VALUES, callback);    
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE user 
    SET username = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM user 
    WHERE user_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

//////////////////////////////////////////////////////
// MODEL FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (data, callback) => {

    const SQLSTATEMENT = `
        SELECT *
        FROM User
        WHERE username = ?;
    `;

    VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//////////////////////////////////////////////////////
// MODEL FOR REGISTER
//////////////////////////////////////////////////////
module.exports.readUserByEmailAndUsername = (data, callback) => {

    const SQLSTATEMENT = `
        SELECT User.email
        FROM User
        WHERE email = ?;

        SELECT User.username
        FROM User
        WHERE username = ?;
    `;

    VALUES = [data.email, data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.register = (data, callback) => {

    const SQLSTATEMENT = `
        INSERT INTO User (username, email, password)
        VALUES (?, ?, ?);
    `;

    VALUES = [data.username, data.email, data.password];

    pool.query(SQLSTATEMENT, VALUES, callback);
};