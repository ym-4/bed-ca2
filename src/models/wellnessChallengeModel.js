const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM wellnesschallenge;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT * FROM wellnesschallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.insertSingle = (data, callback) =>
{
  const SQLSTATMENT = `
    INSERT INTO wellnesschallenge (description, creator_id, points)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.description, data.user_id, data.points];

    pool.query(SQLSTATMENT, VALUES, callback);    
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE wellnesschallenge 
    SET creator_id = ?, description = ?, points = ?
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.user_id, data.description, data.points, data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkOwner = (data, callback) =>
{
   const SQLSTATMENT = `
    select challenge_id, creator_id
    from wellnesschallenge
    where creator_id = ? AND challenge_id = ?;
    `;
    const VALUES = [data.user_id, data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

// The challenges's associated user completions deleted
module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM wellnesschallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.deleteCompletionById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM usercompletion 
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}