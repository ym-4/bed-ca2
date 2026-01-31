const pool = require("../services/db");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
}

bcrypt.hash('1234', saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
  } else {
    console.log("Hashed password:", hash);

    const SQLSTATEMENT = `
        DROP TABLE IF EXISTS UserPetAbilities;

        DROP TABLE IF EXISTS User;

        DROP TABLE IF EXISTS WellnessChallenge;

        DROP TABLE IF EXISTS UserCompletion;

        DROP TABLE IF EXISTS PetBreeds;

        DROP TABLE IF EXISTS PetAbilities;

        DROP TABLE IF EXISTS UserPets;

        DROP TABLE IF EXISTS PetLevelSystem;

        CREATE TABLE User (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points INT DEFAULT 0,
        equipped_pet_id INT DEFAULT NULL

      );

        CREATE TABLE WellnessChallenge (
            challenge_id INT AUTO_INCREMENT PRIMARY KEY,
            creator_id INT NOT NULL,
            description TEXT NOT NULL,
            points INT NOT NULL
        );

        CREATE TABLE UserCompletion (
            completion_id INT AUTO_INCREMENT PRIMARY KEY,
            challenge_id INT NOT NULL,
            user_id INT NOT NULL,
            details TEXT,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO User (username, email, password, points, equipped_pet_id)
        VALUES 
        ('john23', 'john23@email.com', '${hash}', 120, 2),
        ('ben10', 'ben10@email.com', '${hash}', 45, 3),
        ('doe9', 'doe9@email.com', '${hash}', 300, 4),
        ('dave2', 'davidsv2@email.com', '${hash}', 10, 6),
        ('dday6', 'dday6@email.com', '${hash}', 43, null);

        INSERT INTO WellnessChallenge (creator_id, description, points)
        VALUES
        (1, 'Drink 2L of water today', 20),
        (2, 'Walk 5000 steps', 30),
        (1, 'Do a 10-minute meditation session', 15),
        (3, 'Eat a healthy breakfast', 10),
        (2, 'Sleep 8 hours', 25),
        (4, 'Meditate with a 30-minute yoga session', 100);

        INSERT INTO UserCompletion (challenge_id, user_id, details)
        VALUES
        (1, 1, 'this challenge was easy'),
        (2, 1, 'Hit 5200 steps by evening yay'),
        (1, 2, 'Helped a friend'),
        (3, 3, 'Decided to finish tasks early'),
        (3, 5, 'Decided to finish tasks early'),
        (4, 1, 'I had balanced meal today'),
        (2, 5, 'I can do this all day'),
        (5, 3, 'I slept early last night');

        CREATE TABLE PetBreeds (
            breed_id INT AUTO_INCREMENT PRIMARY KEY,
            breed_name VARCHAR(50) NOT NULL,
            description TEXT,
            required_points INT DEFAULT 0
        );

        CREATE TABLE PetAbilities (
            ability_id INT AUTO_INCREMENT PRIMARY KEY,
            ability_name VARCHAR(50) NOT NULL,
            description TEXT,
            required_level INT DEFAULT 0            
        );

        CREATE TABLE UserPets (
            user_pet_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            breed_id INT NOT NULL,
            pet_name VARCHAR(50),              
            pet_level INT DEFAULT 1,           
            experience_points INT DEFAULT 0
        );

        CREATE TABLE PetLevelSystem (
            level_id INT AUTO_INCREMENT PRIMARY KEY,
            level INT NOT NULL,
            xp_required INT NOT NULL,
            description TEXT
        );

        CREATE TABLE UserPetAbilities (
            user_pet_ability_id INT AUTO_INCREMENT PRIMARY KEY,
            user_pet_id INT NOT NULL,
            ability_id INT NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_pet_ability (user_pet_id, ability_id),
            FOREIGN KEY (user_pet_id) REFERENCES UserPets(user_pet_id),
            FOREIGN KEY (ability_id) REFERENCES PetAbilities(ability_id)
        );

        INSERT INTO PetBreeds (breed_name, description, required_points)
        VALUES
        ('Happy Hippo', 'A gentle digital moo deng that represents calmness.', 0),
        ('Playful Puppy', 'A playful dog that encourages daily activity.', 50),
        ('Heroic Platypus', 'A semi-aquatic, egg-laying mammal of action that helps promote mindfulness and slow living.', 120),
        ('Frilly Axolotl', 'Induces longevity in its owner by means of being a familiar', 1000000),
        ('Silly Duck', 'A legendary creature unlocked by high wellness mastery.', 250);

        INSERT INTO PetAbilities (ability_name, description, required_level)
        VALUES
        ('Purrfect Purin Heal', 'Your pet will boost motivation with calming purrs through a bite of pudding comfort.', 0),
        ('Sprint Snack Boost', 'Your pet will give you a burst of energy like taking a quick munch from a dorayaki.', 1),
        ('Shell Melonpan Sanctuary', 'Your pet will help increase focus as if warmed by a cozy melonpan.', 2),
        ('Backflip Dango Burst', 'Your pet will somersault happily, celebrating each completion with a dango.', 3),
        ('Universal Cheer Taiyaki', 'Your pet will provide encouraging cheers served with a fish-shaped treat.', 4);

        INSERT INTO UserPets (user_id, breed_id, pet_name, pet_level, experience_points)
        VALUES
        (1, 1, 'Mochi', 3, 320),
        (1, 2, 'Bolt', 1, 20),
        (2, 1, 'Snowball', 1, 10),
        (3, 3, 'Zenzo', 5, 1300),
        (3, 4, 'Blazewing', 2, 180),
        (5, 4, 'Mint', 2, 250),
        (4, 1, 'Whiskers', 1, 0);

        INSERT INTO PetLevelSystem (level, xp_required, description) 
        VALUES
        (1, 0, 'Newborn Pet'),
        (2, 100, 'Growing Pet'),
        (3, 300, 'Experienced Pet'),
        (4, 600, 'Advanced Pet'),
        (5, 1000, 'Expert Pet'),
        (6, 1500, 'Master Pet'),
        (7, 2100, 'Champion Pet'),
        (8, 2800, 'Legendary Pet'),
        (9, 3600, 'Mythical Pet'),
        (10, 4500, 'Divine Pet');

        INSERT INTO UserPetAbilities (user_pet_id, ability_id)
        VALUES
        (1, 1),
        (1, 2),
        (1, 3),
        (1, 4),
        (2, 1),
        (2, 2),
        (3, 1),
        (3, 2),
        (4, 1),
        (4, 2),
        (4, 3),
        (4, 4),
        (4, 5),
        (5, 1),
        (5, 2),
        (5, 3),
        (6, 1),
        (6, 2),
        (6, 3),
        (7, 1),
        (7, 2);
      `;

    pool.query(SQLSTATEMENT, callback);
  }
});
