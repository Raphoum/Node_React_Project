INSERT INTO Movie (
    title, release_date, runtime, vote_average, vote_count, adult, 
    original_language, overview, popularity, tagline
)
SELECT 
    title, 
    release_date, 
    runtime, 
    vote_average, 
    vote_count, 
    adult, 
    original_language, 
    overview, 
    popularity, 
    tagline
FROM Dataset;


INSERT INTO Genre (genre_name)
SELECT DISTINCT TRIM(value) AS genre_name
FROM (
    SELECT REGEXP_SUBSTR(genres, '[^,]+', 1, COLUMN_VALUE) AS value
    FROM Dataset, TABLE(CAST(MULTISET(
        SELECT LEVEL 
        FROM dual 
        CONNECT BY LEVEL <= 5
    ) AS SYS.ODCINUMBERLIST))
)
WHERE value IS NOT NULL;


INSERT INTO Movie_Genre (movie_id, genre_id)
SELECT DISTINCT 
    m.movie_id, 
    g.genre_id
FROM 
    Dataset d
JOIN 
    Movie m ON m.title = d.title
JOIN 
    Genre g ON INSTR(d.genres, g.genre_name) > 0
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM Movie_Genre mg
        WHERE mg.movie_id = m.movie_id
        AND mg.genre_id = g.genre_id
    );



INSERT INTO Production_Company (name)
SELECT DISTINCT TRIM(value) AS name
FROM (
    SELECT REGEXP_SUBSTR(production_companies, '[^,]+', 1, COLUMN_VALUE) AS value
    FROM Dataset, TABLE(CAST(MULTISET(
        SELECT LEVEL 
        FROM dual 
        CONNECT BY LEVEL <= 5
    ) AS SYS.ODCINUMBERLIST))
)
WHERE value IS NOT NULL;






INSERT INTO Movie_Production_Company (movie_id, company_id)
SELECT DISTINCT
    m.movie_id, 
    pc.company_id
FROM 
    Dataset d
JOIN 
    Movie m ON m.title = d.title
JOIN 
    Production_Company pc ON INSTR(d.production_companies, pc.name) > 0;


INSERT INTO Users ( name, email, age, role) VALUES ( 'Adrien Servas', 'adrienservas@exemple.com', 30, 'User');
INSERT INTO Users ( name, email, age, role) VALUES ( 'Fabrice Renault', 'fabricerenault@exemple.com', 8, 'User');
INSERT INTO Users ( name, email, age, role) VALUES ( 'Clément Roumillhac', 'clementroumillhac@exemple.com', 32, 'User');

INSERT INTO Users (name, email, age, role) VALUES ('Sophie Martin', 'sophiemartin@exemple.com', 27,'User');
INSERT INTO Users (name, email, age, role) VALUES ('Julien Lefevre', 'julienlefevre@exemple.com', 35,'User');
INSERT INTO Users (name, email, age, role) VALUES ('Marie Dufresne', 'mariedufresne@exemple.com', 41,'User');
INSERT INTO Users (name, email, age, role) VALUES ('Alexandre Dupont', 'alexandredupont@exemple.com', 29,'User');
INSERT INTO Users (name, email, age, role) VALUES ('Caroline Petit', 'carolinepetit@exemple.com', 37,'User');
INSERT INTO Users (name, email, age, role) VALUES ('Admin', 'admin@exemple.com', 30, 'admin');


INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 1, 38, TO_DATE('2024-01-01', 'YYYY-MM-DD'));
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 2, 12, TO_DATE('2023-10-16', 'YYYY-MM-DD'));
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 2, 10, TO_DATE('2024-01-15', 'YYYY-MM-DD')); -- Fabrice loue un film
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 1, 15, TO_DATE('2024-01-10', 'YYYY-MM-DD')); -- Adrien loue un autre film
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 3, 20, TO_DATE('2024-01-12', 'YYYY-MM-DD')); -- Clément loue un film
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 2, 25, TO_DATE('2024-01-25', 'YYYY-MM-DD')); -- Fabrice loue un autre film
INSERT INTO Rental ( user_id, movie_id, rental_date) VALUES ( 1, 30, TO_DATE('2024-01-22', 'YYYY-MM-DD')); -- Adrien loue un deuxième film

INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (4, 20, TO_DATE('2024-02-01', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (5, 15, TO_DATE('2024-02-05', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (3, 25, TO_DATE('2024-02-10', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (2, 30, TO_DATE('2024-02-12', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (1, 39, TO_DATE('2024-02-14', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (4, 4, TO_DATE('2024-12-04', 'YYYY-MM-DD'));
INSERT INTO Rental (user_id, movie_id, rental_date) VALUES (7, 2, TO_DATE('2024-11-16', 'YYYY-MM-DD'));


INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES (1, 38,  8.5, 'Film très sympa');
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES (2, 12,  7, 'J ai passé un bon moment');
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES    ( 2, 10, 8.0, 'Très bon film, à revoir !'); -- Fabrice évalue le film 10
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES   ( 1, 15, 7.5, 'Pas mal, mais quelques longueurs.'); -- Adrien évalue le film 15
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES  ( 3, 20, 9.0, 'Excellent ! Une vraie surprise.'); -- Clément évalue le film 20
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES   ( 2, 25, 6.5, 'Un peu déçu, je m’attendais à mieux.'); -- Fabrice évalue un autre film
INSERT INTO Rating ( user_id, movie_id, rating_value, review) VALUES   ( 1, 30, 8.5, 'Une histoire captivante et bien menée.'); -- Adrien évalue un deuxième film

INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (4, 20, 7.5, 'Bon film, mais assez prévisible.');
INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (5, 15, 8.0, 'Très intéressant, mais un peu trop long.');
INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (3, 25, 9.0, 'Excellent ! L’histoire est captivante.');
INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (2, 30, 6.5, 'Assez décevant, je m’attendais à mieux.');
INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (1, 39, 8.5, 'Un super film, j’ai adoré !');
INSERT INTO Rating (user_id, movie_id, rating_value, review) VALUES (7, 2, 9.0, 'Un chef d’oeuvre');


ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. ';