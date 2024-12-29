import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import oracledb from 'oracledb';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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

const swaggerOptions = {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'Node and React Project API',
          version: '1.0.0',
          description: 'REST API documentation for the backend of the Node and React project',
      },
  },
  apis: ['./src/**/*.ts'], // files containing annotations as above
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log('Swagger UI available at http://localhost:5000/api-docs');


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
/**
 * @swagger
 * /updateuser:
 *   post:
 *     summary: Update user information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: All fields (user_id, name, email, age) are required
 *       404:
 *         description: User not found or no changes made
 *       500:
 *         description: Error updating user
 */
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
/**
 * @swagger
 * /rental:
 *   post:
 *     summary: Create a new rental
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               movie_id:
 *                 type: number
 *               rental_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rental created successfully
 *       400:
 *         description: All fields are required
 *       409:
 *         description: Movie already rented
 *       500:
 *         description: Error creating rental
 */
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
    if (error.errorNum === 20002) {
      return res.status(409).send({ error: 'Movie already rented.' });
    }
    res.status(500).send({ error: error.message });
  } finally {
    await closeConnection(connection);
  }
});

// Fetch rentals
/**
 * @swagger
 * /rental2:
 *   get:
 *     summary: Fetch all rentals
 *     responses:
 *       200:
 *         description: A list of rentals
 *       500:
 *         description: Error fetching rentals
 */
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
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Fetch all users
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Error fetching users
 */
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
/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Fetch all movies
 *     responses:
 *       200:
 *         description: A list of movies
 *       500:
 *         description: Error fetching movies
 */
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
/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Fetch all genres
 *     responses:
 *       200:
 *         description: A list of genres
 *       500:
 *         description: Error fetching genres
 */
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
/**
 * @swagger
 * /submit-rating:
 *   post:
 *     summary: Submit a rating and review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               movie_id:
 *                 type: number
 *               rating_value:
 *                 type: number
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating and review submitted successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Error submitting rating
 */
app.post('/submit-rating', async (req: Request<{}, {}, RatingRequest>, res: Response) => {
  const { user_id, movie_id, rating_value, review } = req.body;

  if (!user_id || !movie_id || !rating_value || !review) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. '");
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

// Endpoint for the ratings
/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Fetch all ratings
 *     responses:
 *       200:
 *         description: A list of ratings
 *       500:
 *         description: Error fetching ratings
 */
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
  
  // Endpoint for the production companies
  /**
 * @swagger
 * /production-companies:
 *   get:
 *     summary: Fetch all production companies
 *     responses:
 *       200:
 *         description: A list of production companies
 *       500:
 *         description: Error fetching production companies
 */
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


// Endpoint for the movie genres
/**
 * @swagger
 * /movie-genres:
 *   get:
 *     summary: Fetch all movie genres
 *     responses:
 *       200:
 *         description: A list of movie genres
 *       500:
 *         description: Error fetching movie genres
 */
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

// Login
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Error processing login request
 */
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
  
      if (!result.rows || result.rows.length === 0) {
        return res.status(401).send({ error: 'Invalid email or password' });
      }
        const user = result.rows[0] as {
        USER_ID: number;
        NAME: string;
        EMAIL: string;
        AGE: number;
        ROLE: string;
      };
  
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

// Signup
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: number
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: All fields (name, email, age, role) are required
 *       403:
 *         description: Cannot create an account with the admin email
 *       500:
 *         description: Error creating user
 */
  app.post('/signup', async (req, res) => {
    const { name, email, age, role } = req.body;
  
    if (!name || !email || !age || !role) {
      return res.status(400).send({ error: 'All fields (name, email, age, role) are required' });
    }
  
    if (email.toLowerCase() === 'admin@exemple.com') {
      return res.status(403).send({ error: 'Cannot create an account with the admin email' });
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
  
      const checkQuery = 'SELECT COUNT(*) AS count FROM Users WHERE email = :email';
      const checkResult = await connection.execute(checkQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!checkResult.rows || checkResult.rows.length === 0 || !checkResult.rows[0]) {
        return res.status(500).send({ error: 'Unexpected error retrieving user count' });
        }
      const count = (checkResult.rows[0] as { COUNT: number }).COUNT;
      if (count > 0) {
        return res.status(400).send({ error: 'Email already exists' });
      }

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
/**
 * @swagger
 * /execute-sql:
 *   post:
 *     summary: Execute a SQL query
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query executed successfully
 *       400:
 *         description: No SQL query provided
 *       500:
 *         description: Error executing query
 */
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
/**
 * @swagger
 * /delete-user:
 *   post:
 *     summary: Delete a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User ID is required
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
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
