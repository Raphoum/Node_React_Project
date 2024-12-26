import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces for typing
interface User {
  user_id: number;
  name: string;
  email: string;
  age: number;
}

interface Movie {
  movie_id: number;
  title: string;
  original_language: string;
  overview: string;
  popularity: number;
  release_date: string;
  runtime: number;
  tagline: string;
  vote_average: number;
  vote_count: number;
  adult: boolean;
}

interface Rental {
  rental_id: number;
  rental_date: string;
  end_date: string | null;
  movie_id: number;
  movie_title: string;
  runtime: string | null;
  rating_value: string | null;
  review: string | null;
}

interface UserPanelProps {
  user: User;
  onLogout: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, onLogout }) => {
  // States
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [personalInfo, setPersonalInfo] = useState<User>(user);
  const [locations, setLocations] = useState<Rental[]>([]);
  const [movieSearch, setMovieSearch] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState<string>('');
  const [review, setReview] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 30;

  const paginatedResults = result.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(result.length / itemsPerPage);

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch user locations
  const fetchLocations = async () => {
    try {
      setError('');
      const response = await axios.get('http://localhost:5000/rental2');
      const userLocations = response.data.filter(
        (rental: any) => rental.USER_ID === user.user_id
      );
      setLocations(
        userLocations.map((rental: any) => ({
          rental_id: rental.RENTAL_ID,
          rental_date: rental.RENTAL_DATE,
          end_date: rental.END_DATE,
          movie_id: rental.MOVIE_ID,
          movie_title: rental.MOVIE_TITLE || 'Unknown title',
          runtime: rental.MOVIE_DURATION || 'Not specified',
          rating_value: rental.MOVIE_RATING || 'Not rated',
          review: rental.MOVIE_REVIEW || 'No review',
        }))
      );
    } catch (err: any) {
      setError('Error fetching locations.');
    }
  };

  // Update personal information
  const updatePersonalInfo = async () => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/updateuser', {user_id: user.user_id,name: personalInfo.name,email: personalInfo.email,age: personalInfo.age,});
      const updatedUser = response.data.updatedUser;
      setPersonalInfo({
        ...personalInfo,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
      });
      alert('Information updated successfully!');
    } catch (err: any) { 
        console.error(err);
      setError(err.response?.data?.error || 'Error updating information.');
    }
  };

   // Fonction pour exécuter une requête SQL
   const executePredefinedQuery = async (query: string) => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/execute-sql', { query });
      setResult(response.data.result);
    } catch (err:any) {
        console.log(err);
      setError(err.response?.data?.error || 'Error executing query');
    } 
  };

  // Submit rating and review
  const submitRating = async (rentalId: number) => {
    try {
      setError('');
      await axios.post('http://localhost:5000/submit-rating', {
        user_id: user.user_id,
        movie_id: rentalId,
        rating_value: parseInt(rating),
        review,
      });
      alert('Rating and review submitted successfully!');
      setRating('');
      setReview('');
      fetchLocations(); // Refresh locations
    } catch (err: any) {
      setError('Error submitting the rating.');
    }
  };

  // Fetch movies when searching
  useEffect(() => {
    const fetchMovies = async () => {
      if (!movieSearch.trim()) {
        setMovies([]);
        return;
      }
      try {
        const response = await axios.post('http://localhost:5000/execute-sql', {
          query: `SELECT * FROM Movie WHERE title LIKE '%${movieSearch}%'`,
        });
        setMovies(response.data.result || []);
      } catch (err: any) {
        setError('Error fetching movies.');
      }
    };
    fetchMovies();
  }, [movieSearch]);

  return (
    <div className="container">
      <section className="section">
        <h1 className="title has-text-centered">Profile: {user.name}</h1>
      </section>

      {/* Personal information */}
      <section className="section">
        <div className="box">
          <h2 className="subtitle">Edit your personal information</h2>
          <input
            className="input"
            type="text"
            placeholder="Name"
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Age"
            value={personalInfo.age}
            onChange={(e) => setPersonalInfo({ ...personalInfo, age: parseInt(e.target.value) })}
          />
          <button className="button is-link" onClick={updatePersonalInfo}>
            Update
          </button>
        </div>
      </section>

      {/* Locations */}
      <section className="section">
        <div className="box">
          <h2 className="subtitle">Your Rentals</h2>
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Movie Title</th>
                <th>Rental Date</th>
                <th>Expiration Date</th>
                <th>Runtime</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.rental_id}>
                  <td>{loc.movie_title || 'Unknown title'}</td>
                  <td>
                    {loc.rental_date
                      ? new Date(loc.rental_date).toLocaleDateString()
                      : 'Not available'}
                  </td>
                  <td>
                    {loc.end_date ? new Date(loc.end_date).toLocaleDateString() : 'Not available'}
                  </td>
                  <td>{loc.runtime || '-'} min</td>
                  <td>{loc.rating_value || 'Not rated'}</td>
                  <td>{loc.review || 'No review'}</td>
                  <td>
                    {(loc.rating_value === 'Not rated' || loc.review === 'No review') && (
                      <>
                        <input
                          className="input is-small"
                          type="number"
                          placeholder="Rating (0-10)"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        />
                        <textarea
                          className="textarea is-small"
                          placeholder="Your review"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                        ></textarea>
                        <button
                          className="button is-warning is-small"
                          onClick={() => submitRating(loc.rental_id)}
                        >
                          Submit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      
    {/* Requêtes SQL supplémentaires */}
    <section className="section">
      <div className="box">
        <button
          className="button is-info is-fullwidth"
          onClick={() =>
            executePredefinedQuery(`  
              SELECT
                  g.genre_name,
                  sub.title AS best_movie,
                  sub.max_vote_average AS max_avg_rating
              FROM
                  Genre g
              JOIN (
                  SELECT
                      mg.genre_id,
                      m.title,
                      TO_NUMBER(m.vote_average) AS max_vote_average
                  FROM
                      Movie m
                  JOIN
                      Movie_Genre mg ON m.movie_id = mg.movie_id
                  WHERE
                      TO_NUMBER(m.vote_average) = (
                          SELECT MAX(TO_NUMBER(m2.vote_average))
                          FROM
                              Movie m2
                          JOIN
                              Movie_Genre mg2 ON m2.movie_id = mg2.movie_id
                          WHERE
                              mg2.genre_id = mg.genre_id
                      )
              ) sub ON g.genre_id = sub.genre_id
              `)
          }
        >
          Meilleur film par genre
        </button>
        <button
          className="button is-link is-fullwidth"
          onClick={() =>
            executePredefinedQuery(`
              SELECT 
                  m.title AS movie_title, 
                  TO_NUMBER(m.vote_average) AS average_rating,
                  RANK() OVER (ORDER BY TO_NUMBER(m.vote_average) DESC) AS ranking
              FROM 
                  Movie m
              ORDER BY 
                  ranking
                  `)
          }
        >
          Classement des films
        </button>
      </div>
    </section>

    {/* Résultats de requête */}
    {result.length > 0 && (
  <section className="section">
    <div className="box">
      <h2 className="subtitle">Résultats</h2>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            {Object.keys(result[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedResults.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <nav className="pagination is-centered" role="navigation" aria-label="pagination">
        <button
          className="pagination-previous"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="pagination-next"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <ul className="pagination-list">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                className={`pagination-link ${currentPage === i + 1 ? 'is-current' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </section>
)}

      {/* Search a movie */}
      <section className="section">
        <div className="box">
          <h2 className="subtitle">Search for a movie</h2>
          <input
            className="input"
            type="text"
            placeholder="Search for a movie"
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
          />
          {movies.length > 0 && (
            <ul>
              {movies.map((movie) => (
                <li key={movie.movie_id}>
                  <strong>{movie.title}</strong> ({movie.release_date})
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Logout */}
      <section className="section">
        <button className="button is-danger is-fullwidth" onClick={onLogout}>
          Logout
        </button>
      </section>
    </div>
  );
};

export default UserPanel;
