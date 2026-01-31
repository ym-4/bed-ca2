const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM userpets;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
   const SQLSTATMENT = `
    select up.user_pet_id, 
    up.user_id, 
    up.breed_id, 
    pb.breed_name, 
    up.pet_name, 
    up.pet_level, 
    up.experience_points
    from userpets up, petbreeds pb
    where up.breed_id = pb.breed_id 
    and user_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.checkXP = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT breed_id, required_points, points 
    FROM petbreeds, user
    WHERE user_id = ? AND breed_id = ?;
    `;
    const VALUES = [data.userId, data.breedId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.checkForDupes = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT * 
    FROM userpets
    WHERE user_id = ? AND breed_id = ?;
    `;
    const VALUES = [data.userId, data.breedId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.insertSingle = (data, callback) =>
{
  const SQLSTATMENT = `
    INSERT INTO userpets (user_id, breed_id, pet_name, pet_level, experience_points)
    VALUES (?, ?, ?, ?, ?);
    `;
    const VALUES = [data.userId, data.breedId, data.pet_name, data.pet_level, data.experience_points];

    pool.query(SQLSTATMENT, VALUES, callback);    
}

module.exports.updatePoints = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User
        SET points = points - (
        SELECT required_points 
        FROM petbreeds 
        WHERE breed_id = ?
        )
    WHERE user_id = ?;
    `;
    const VALUES = [data.breedId, data.userId];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectAllBreeds = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM petbreeds;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectBreedById = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT * FROM petbreeds
    WHERE breed_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.readUserPets = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT * FROM userpets
    WHERE user_pet_id = ?;
    `;
    const VALUES = [data.userPetId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.selectByUserPetId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM userpets
    WHERE user_id = ? and user_pet_id = ?;
    `;
    const VALUES = [data.userId, data.userPetId];
    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updatePet = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE userpets
    set pet_name = ?
    WHERE user_id = ? AND user_pet_id = ?;
    `;
    const VALUES = [data.pet_name, data.userId, data.userPetId];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectAllAbilities = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM petabilities;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.checkIfPetEquipped = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT u.equipped_pet_id, up.pet_name
    FROM User u, UserPets up
    WHERE u.equipped_pet_id = up.user_pet_id
    AND u.user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.equipPet = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User 
    SET equipped_pet_id = ? 
    WHERE user_id = ?;
    `;
    const VALUES = [data.pet_id, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.unequipPet = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User
    SET equipped_pet_id = NULL
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkLevel = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT user_pet_id, pet_level, required_level, pet_level
    FROM petabilities, userpets
    WHERE user_id = ? AND user_pet_id = ? AND ability_id = ?;
    `;
    const VALUES = [data.userId, data.userPetId, data.abilityId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.checkOwnAbility = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT user_pet_id, ability_id
    FROM userpetabilities
    WHERE user_pet_id = ? AND ability_id = ?;
    `;
    const VALUES = [data.userPetId, data.abilityId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.unlockNewAbility = (data, callback) =>
{
  const SQLSTATMENT = `
    INSERT INTO UserPetAbilities (user_pet_id, ability_id)
    VALUES (?, ?);
    `;
    const VALUES = [data.userPetId, data.abilityId];

    pool.query(SQLSTATMENT, VALUES, callback);    
}

module.exports.selectAllAbilitiesById = (data, callback) =>
{
   const SQLSTATMENT = `
    SELECT upa.user_pet_ability_id, 
    upa.user_pet_id, 
    upa.ability_id, 
    pa.ability_name, 
    upa.unlocked_at
    FROM pet.userpetabilities upa, petabilities pa
    where upa.ability_id = pa.ability_id
    and user_pet_id = ?;
    `;
    const VALUES = [data.userPetId];

    pool.query(SQLSTATMENT, VALUES, callback); 
}

module.exports.selectTop5 = (callback) =>
{
    const SQLSTATMENT = `
    SELECT 
    u.username,
    COUNT(DISTINCT uc.completion_id) AS challenges_completed,
    u.points + COALESCE(SUM(up.experience_points), 0) AS total_points_earned
    FROM User u
    LEFT JOIN UserCompletion uc ON u.user_id = uc.user_id
    LEFT JOIN UserPets up ON u.user_id = up.user_id
    GROUP BY u.user_id, u.username, u.points
    ORDER BY total_points_earned DESC
    LIMIT 5;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectTopPet = (callback) =>
{
    const SQLSTATMENT = `
    SELECT breed_id, breed_name
    FROM petbreeds
    WHERE breed_id = (
        SELECT breed_id
        FROM userpets
        GROUP BY breed_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    );
    `;

    pool.query(SQLSTATMENT, callback);
}