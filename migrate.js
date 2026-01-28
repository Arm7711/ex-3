import moment from 'moment';
import DB from './clients/db.mysql.js';
import { createSeatsForShowtime } from './models/seats.js';

(async () => {
  try {
    await DB.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        dob DATE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);

    await DB.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INT NOT NULL,
        genre VARCHAR(100),
        release_year INT,
        poster_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);

    await DB.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      movie_id INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment_text VARCHAR(500),
      status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_user_movie (user_id, movie_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    )
  `);

    await DB.query(`
      CREATE TABLE IF NOT EXISTS showtimes (
        id INT NOT NULL AUTO_INCREMENT,
        movie_id INT NOT NULL,
        show_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        hall_number INT NOT NULL,
        price INT NOT NULL,
        available_seats INT NOT NULL,
        total_seats INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      )
    `);

    await DB.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id INT NOT NULL AUTO_INCREMENT,
        showtime_id INT NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        seat_row INT NOT NULL,
        seat_type VARCHAR(20) DEFAULT 'standard',
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE
      )
    `);

    await DB.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        showtime_id INT NOT NULL,
        seat_id INT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        total_price FLOAT NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
        FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
      )
    `);

    await DB.query(`
      INSERT IGNORE INTO users 
      (first_name, last_name, email, dob, password, role) 
      VALUES 
      ('Admin', 'System', 'admin@theatre.com', '1990-01-01', MD5(CONCAT(MD5('admin123'), ?)), 'admin')
    `, [process.env.USER_SECRET]);



    const movies = [
      ['The Matrix', 'A computer hacker learns about the true nature of reality.', 136, 'Sci-Fi', 1999, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn_iufQjZbf3eraS7sMA6utPX9JPK34EsLww&s'],
      ['Inception', 'A thief steals corporate secrets through dream-sharing technology.', 148, 'Sci-Fi', 2010, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-qDRs9IfyHPaG4VU_5dafhaGl7Z1JbuEAiQ&s'],
      ['Interstellar', 'A team of explorers travel through a wormhole in space.', 169, 'Sci-Fi', 2014, 'https://wallpapers.com/images/hd/monochrome-blast-interstellar-poster-kxjdkmsfvtbjoutx.jpg']
    ];

    for (const m of movies) {
      const [res] = await DB.query(`
    INSERT INTO movies 
      (title, description, duration_minutes, genre, release_year, poster_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, true)
    ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
  `, m);

      const movieId = res.insertId;

      const today = new Date();
      for (let i = 0; i < 2; i++) {
        const showDate = new Date(today);
        showDate.setDate(today.getDate() + i);

        const startTime = i === 0 ? '12:00:00' : '18:00:00';
        const endTime = i === 0 ? '14:00:00' : '20:00:00';

        const [res] = await DB.query(`
    INSERT INTO showtimes
    (movie_id, show_date, start_time, end_time, hall_number, price, available_seats, total_seats)
    VALUES (?, ?, ?, ?, 1, 500, 25, 25)
  `, [movieId, moment(showDate).format('YYYY-MM-DD'), startTime, endTime]);

        const showtimeId = res.insertId;
        await createSeatsForShowtime(showtimeId, 5, 5);

      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
})();
