const pool = require('../services/db');

module.exports.selectById = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT completion_id "complete_id", challenge_id, user_id, details
    FROM usercompletion
    WHERE completion_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.checkChallenge = (data, callback) =>
{
    const SQLSTATMENT = `
     SELECT challenge_id
     FROM wellnesschallenge
     WHERE challenge_id = ?;
     `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkUser = (data, callback) =>
{
    const SQLSTATMENT = `
     SELECT user_id
     FROM user
     WHERE user_id = ?;
     `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkRecent = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT completion_id 
    FROM UserCompletion 
    WHERE challenge_id = ? 
    AND user_id = ? 
    AND completed_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);
     `;
    const VALUES = [data.challenge_id, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkEquippedPet = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT equipped_pet_id
    FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) =>
{
  const SQLSTATMENT = `
    INSERT INTO usercompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.challenge_id, data.user_id, data.details];

    pool.query(SQLSTATMENT, VALUES, callback);    
}

module.exports.updateUserPoints = (data, callback) =>
{
    const SQLSTATMENT = `
     UPDATE User
        SET points = points + (
        SELECT points 
        FROM WellnessChallenge 
        WHERE challenge_id = ?
        )
    WHERE user_id = ?;

     `;
    const VALUES = [data.challenge_id, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.awardPetXP = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE UserPets
        SET experience_points = experience_points + (
        SELECT points
        FROM WellnessChallenge
        WHERE challenge_id = ?
    )
    WHERE user_pet_id = ?;
    `;
    const VALUES = [data.challenge_id, data.pet_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkPetLevelUp = (data, callback) =>
{
    // Get current XP
    const getXPSQL = `SELECT experience_points FROM UserPets WHERE user_pet_id = ?`;
    
    pool.query(getXPSQL, [data.pet_id], (error, results, fields) => {
        if (error) {
            callback(error, null, null);
            return;
        }
        
        if (results.length === 0) {
            callback(new Error("Pet not found"), null, null);
            return;
        }
        
        const currentXP = results[0].experience_points;
        
        let newLevel = 1;
        if (currentXP >= 4500) newLevel = 10;
        else if (currentXP >= 3600) newLevel = 9;
        else if (currentXP >= 2800) newLevel = 8;
        else if (currentXP >= 2100) newLevel = 7;
        else if (currentXP >= 1500) newLevel = 6;
        else if (currentXP >= 1000) newLevel = 5;
        else if (currentXP >= 600) newLevel = 4;
        else if (currentXP >= 300) newLevel = 3;
        else if (currentXP >= 100) newLevel = 2;
        
        // Get current level
        const getLevelSQL = `SELECT pet_level FROM UserPets WHERE user_pet_id = ?`;
        pool.query(getLevelSQL, [data.pet_id], (levelError, levelResults, levelFields) => {
            if (levelError) {
                callback(levelError, null, null);
                return;
            }
            
            const currentLevel = levelResults[0]?.pet_level || 1;
            
            if (newLevel > currentLevel) {
                const updateSQL = `UPDATE UserPets SET pet_level = ? WHERE user_pet_id = ?`;
                pool.query(updateSQL, [newLevel, data.pet_id], (updateError, updateResults, updateFields) => {
                    if (updateError) {
                        callback(updateError, null, null);
                    } else {
                        callback(null, {
                            leveledUp: true,
                            oldLevel: currentLevel,
                            newLevel: newLevel
                        }, updateFields);
                    }
                });
            } else {
                callback(null, {
                    leveledUp: false,
                    currentLevel: currentLevel,
                    newLevel: newLevel
                }, fields);
            }
        });
    });
}

module.exports.selectByChallenge = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT user_id, details
    FROM usercompletion
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}
