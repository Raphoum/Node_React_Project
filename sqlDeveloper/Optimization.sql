CREATE INDEX idx_rental_user_id ON Rental(user_id);
CREATE INDEX idx_rental_movie_id ON Rental(movie_id);
CREATE INDEX idx_movie_movie_id ON Movie(movie_id);
CREATE INDEX idx_users_user_id ON Users(user_id);
CREATE INDEX idx_rating_movie_id ON Rating(movie_id);


SELECT index_name, column_name
FROM user_ind_columns
WHERE table_name = 'USERS';
