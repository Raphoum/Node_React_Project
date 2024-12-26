import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import oracledb from 'oracledb';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbConfig = {
  user: 'SYSTEM',
  password: 'oracleRek765',
  connectString: 'localhost:1521/xepdb1',
};

// Types
interface UserRequest {
  user_id?: string;
  name?: string;
  email?: string;
  age?: string;
  role?: string;
}

interface RentalRequest {
  user_id: number;
  movie_id: number;
  rental_date: string;
}

interface RatingRequest {
  user_id: number;
  movie_id: number;
  rating_value: number;
  review: string;
}

interface SQLQueryRequest {
  query: string;
}

// Utility function to handle database connections safely
const closeConnection = async (connection: oracledb.Connection | undefined) => {
  if (connection) {
    try {
      await connection.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
};

// Update user
app.post('/updateuser', async (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { user_id, name, email, age } = req.body as UserRequest;
  if (!user_id || !name || !email || !age) {
    return res.status(400).send({ error: 'All fields (user_id, name, email, age) are required' });
  }
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      UPDATE Users
      SET name = :name, email = :email, age = :age
      WHERE user_id = :user_id
    `;
    const result = await connection.execute(query, { name, email, age: parseInt(age, 10), user_id: parseInt(user_id, 10) }, { autoCommit: true });
    console.log(result);
    if (result.rowsAffected === 0) {
      return res.status(404).send({ error: 'User not found or no changes made' });
    }

    res.status(200).send({ message: 'User updated successfully!' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Create rental
app.post('/rental', async (req: Request<{}, {}, RentalRequest>, res: Response) => {
  const { user_id, movie_id, rental_date } = req.body;

  if (!user_id || !movie_id || !rental_date) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      INSERT INTO Rental (user_id, movie_id, rental_date)
      VALUES (:user_id, :movie_id, :rental_date)
    `;
    await connection.execute(query, { user_id, movie_id, rental_date: new Date(rental_date) }, { autoCommit: true });
    res.status(201).send({ message: 'Rental created successfully!' });
  } catch (error: any) {
    console.error('Error creating rental:', error);
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

app.get('/rental2', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const query = `
        SELECT 
            r.rental_id, 
            r.rental_date, 
            r.end_date, 
            r.user_id,
            m.movie_id,
            m.title AS movie_title, 
            m.runtime AS movie_duration, 
            rt.rating_value AS movie_rating, 
            rt.review AS movie_review
        FROM 
            Rental r
        JOIN 
            Movie m ON r.movie_id = m.movie_id
        LEFT JOIN 
            Rating rt ON r.user_id = rt.user_id AND r.movie_id = rt.movie_id
      `;
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.status(200).json(result.rows);
    } catch (error:any) {
      res.status(500).send({ error: error.message });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  });

// Fetch users
app.get('/users', async (_req: Request, res: Response) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = 'SELECT user_id, name, email, age, role FROM Users';
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT  });
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Fetch movies
app.get('/movies', async (_req: Request, res: Response) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      SELECT m.movie_id, m.title, m.release_date, m.runtime, m.vote_average, 
             m.vote_count, m.adult, m.original_language, m.overview, m.popularity, m.tagline
      FROM Movie m
    `;
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT  });
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Fetch genres
app.get('/genres', async (_req: Request, res: Response) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = 'SELECT genre_id, genre_name FROM Genre';
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT  });
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Submit rating
app.post('/submit-rating', async (req: Request<{}, {}, RatingRequest>, res: Response) => {
  const { user_id, movie_id, rating_value, review } = req.body;

  if (!user_id || !movie_id || !rating_value || !review) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      INSERT INTO Rating (user_id, movie_id, rating_value, review)
      VALUES (:user_id, :movie_id, :rating_value, :review)
    `;
    await connection.execute(query, { user_id, movie_id, rating_value, review }, { autoCommit: true });
    res.status(201).send({ message: 'Rating and review submitted successfully!' });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Endpoint pour les notes (ratings)
app.get('/ratings', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const query = `
        SELECT r.rating_id, r.user_id, r.movie_id, r.rating_value, r.review
        FROM Rating r
      `;
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.status(200).json(result.rows);
    } catch (error:any) {
      res.status(500).send({ error: error.message });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  });
  
  // Endpoint pour les compagnies de production
  app.get('/production-companies', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const query = `
        SELECT pc.company_id, pc.name
        FROM Production_Company pc
      `;
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.status(200).json(result.rows);
    } catch (error:any) {
      res.status(500).send({ error: error.message });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  });


// Endpoint pour les relations entre films et genres
app.get('/movie-genres', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const query = `
        SELECT mg.movie_id, g.genre_name
        FROM Movie_Genre mg
        JOIN Genre g ON mg.genre_id = g.genre_id
      `;
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.status(200).json(result.rows);
    } catch (error:any) {
      res.status(500).send({ error: error.message });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  });

// Login endpoint
app.post('/login', async (req: Request<{}, {}, { email: string; password: string }>, res: Response) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).send({ error: 'Email and password are required' });
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const query = `
        SELECT user_id, name, email, age, role
        FROM Users
        WHERE email = :email AND role = :password
      `;
      const result = await connection.execute(query, [email, password], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  
      // Vérifiez si `rows` est défini
      if (!result.rows || result.rows.length === 0) {
        return res.status(401).send({ error: 'Invalid email or password' });
      }
  
      // Extraire les données utilisateur
      const user = result.rows[0] as {
        USER_ID: number;
        NAME: string;
        EMAIL: string;
        AGE: number;
        ROLE: string;
      };
  
      // Retourne les informations utilisateur
      res.send({
        user_id: user.USER_ID,
        name: user.NAME,
        email: user.EMAIL,
        age: user.AGE,
        role: user.ROLE,
      });
    } catch (error: any) {
      console.error('Error processing login request:', error.message);
      res.status(500).send({ error: 'Error processing login request.' });
    } finally {
      await closeConnection(connection);
    }
  });

  app.post('/signup', async (req, res) => {
    const { name, email, age, role } = req.body;
  
    if (!name || !email || !age || !role) {
      return res.status(400).send({ error: 'All fields (name, email, age, role) are required' });
    }
  
    // Vérifier si l'email est celui de l'administrateur
    if (email.toLowerCase() === 'admin@exemple.com') {
      return res.status(403).send({ error: 'Cannot create an account with the admin email' });
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
  
      // Vérifier si l'email existe déjà dans la base de données
      const checkQuery = 'SELECT COUNT(*) AS count FROM Users WHERE email = :email';
      const checkResult = await connection.execute(checkQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!checkResult.rows || checkResult.rows.length === 0 || !checkResult.rows[0]) {
        return res.status(500).send({ error: 'Unexpected error retrieving user count' });
        }
      const count = (checkResult.rows[0] as { COUNT: number }).COUNT;
      if (count > 0) {
        return res.status(400).send({ error: 'Email already exists' });
      }

  
      // Insérer le nouvel utilisateur dans la table Users
      const insertQuery = `
        INSERT INTO Users (name, email, age, role)
        VALUES (:name, :email, :age, :role)
      `;
      await connection.execute(insertQuery, [name, email, age, role], { autoCommit: true });
  
      res.send({ message: 'User created successfully' });
    } catch (error:any) {
      res.status(500).send({ error: error.message });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  });
  


// Execute SQL Query
app.post('/execute-sql', async (req: Request<{}, {}, SQLQueryRequest>, res: Response) => {
    const { query } = req.body;
  
    console.log('Request :', query);
    if (!query) {
      return res.status(400).send({ error: 'No SQL query provided' });
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      await connection.execute("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. '");
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      res.send({ result: result.rows });
    } catch (error: any) {
      console.error('Error executing query:', error.message);
      res.status(500).send({ error: error.message });
    } finally {
      await closeConnection(connection);
    }
  });
  
  // Delete User
  app.post('/delete-user', async (req: Request<{}, {}, { user_id: number }>, res: Response) => {
    const { user_id } = req.body;
  
    if (!user_id) {
      return res.status(400).send({ error: 'User ID is required' });
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const deleteQuery = 'DELETE FROM Users WHERE user_id = :user_id';
      const result = await connection.execute(deleteQuery, [user_id], { autoCommit: true });
  
      if (!result.rowsAffected) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      res.send({ message: 'User deleted successfully!' });
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      res.status(500).send({ error: error.message });
    } finally {
      await closeConnection(connection);
    }
  });
  

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
