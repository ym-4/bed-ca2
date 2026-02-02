const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Reviews;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Reviews
    WHERE id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO Reviews (review_amt, name, user_id, description)
    VALUES (?, ?, ?, ?);
    `;
    const VALUES = [data.review_amt, data.name, data.user_id, data.description];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkRecent = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM reviews 
    WHERE user_id = ? 
    AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);
     `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkOwner = (data, callback) =>
{
   const SQLSTATMENT = `
    select id, user_id
    from reviews
    where user_id = ? AND id = ?;
    `;
    const VALUES = [data.user_id, data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE Reviews 
    SET review_amt = ?, name = ?, user_id = ?, description = ?
    WHERE id = ?;
    `;
    const VALUES = [data.review_amt, data.name, data.user_id, data.description, data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM Reviews 
    WHERE id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}