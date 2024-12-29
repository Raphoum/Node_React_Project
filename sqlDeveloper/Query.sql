ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. ';


--Cette requête affiche les informations sur les utilisateurs, y compris les films qu'ils ont loués et la date de retour.
SELECT 
    u.name AS user_name, 
    m.title AS movie_title, 
    r.rental_date, 
    r.end_date
FROM 
    Rental r
JOIN 
    Users u ON u.user_id = r.user_id
JOIN 
    Movie m ON r.movie_id = m.movie_id;

--Cette requête calcule combien de films chaque utilisateur a loués.
SELECT 
    u.name AS user_name,
    COUNT(r.movie_id) AS total_rentals
FROM 
    Users u
LEFT JOIN 
    Rental r ON u.user_id = r.user_id
GROUP BY 
    u.user_id, u.name;
    
--Cette requête calcule la moyenne des notes des films ainsi que le nombre de critiques pour chaque film de nos clients.
SELECT 
    m.title AS movie_title, 
    ROUND(SUM(rt.rating_value) / COUNT(rt.rating_value), 3) AS average_rating, -- Moyenne arrondie à 3 décimales
    COUNT(rt.rating_value) AS number_of_reviews
FROM 
    Movie m
JOIN 
    Rating rt ON m.movie_id = rt.movie_id
GROUP BY 
    m.movie_id, m.title;

--Utilisation d'une sous-requête pour trouver les utilisateurs qui ont loué plus de 3 films
SELECT 
    u.name AS user_name
FROM 
    Users u
WHERE 
    (SELECT COUNT(*) FROM Rental r WHERE r.user_id = u.user_id) > 3;
 
--Ranking entre les notes de nos clients (supprimer les AVG pour etre plus efficace)
SELECT 
    m.title AS movie_title, 
    ROUND(AVG(rt.rating_value), 3) AS average_rating,
    RANK() OVER (ORDER BY ROUND(AVG(rt.rating_value), 3) DESC) AS ranking
FROM 
    Movie m
JOIN 
    Rating rt ON m.movie_id = rt.movie_id
GROUP BY 
    m.movie_id, m.title
ORDER BY 
    ranking;

--Afficher tous les films d'un genre
SELECT m.title, m.release_date, m.runtime, m.vote_average, m.vote_count, m.popularity
FROM Movie m
JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
JOIN Genre g ON mg.genre_id = g.genre_id
WHERE g.genre_name = 'Romance'; -- Remplacez par le genre de votre choix

--Affichage des utilisateurs avec les films loués et leurs dates de fin de location
SELECT 
    u.name AS user_name, 
    m.title AS movie_title, 
    r.end_date
FROM 
    Users u
LEFT JOIN 
    Rental r ON u.user_id = r.user_id
LEFT JOIN 
    Movie m ON r.movie_id = m.movie_id;

--Top 5 des utilisateurs ayant loué le plus de films
SELECT 
    u.name AS user_name,
    COUNT(r.rental_id) AS total_rentals,
    RANK() OVER (ORDER BY COUNT(r.rental_id) DESC) AS ranking
FROM 
    Users u
JOIN 
    Rental r ON u.user_id = r.user_id
GROUP BY 
    u.user_id, u.name
FETCH FIRST 5 ROWS ONLY;

--Requête pour lister les films associés à plusieurs compagnies de productions.
SELECT 
    m.title AS movie_title, 
    (SELECT LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name)
     FROM movie_production_company mpc
     JOIN production_company pc ON mpc.company_id = pc.company_id
     WHERE mpc.movie_id = m.movie_id
    ) AS production_company
FROM 
    Movie m
WHERE 
    (SELECT COUNT(*) 
     FROM movie_production_company mpc_sub 
     WHERE mpc_sub.movie_id = m.movie_id) > 1;

--Requête pour trouver le film ayant la meilleure moyenne des notes dans chaque genre.
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
) sub ON g.genre_id = sub.genre_id;

--afficher les films avec leur classement basé sur la moyenne des notes
SELECT 
    m.title AS movie_title, 
    TO_NUMBER(m.vote_average) AS average_rating,
    RANK() OVER (ORDER BY TO_NUMBER(m.vote_average) DESC) AS ranking
FROM 
    Movie m
ORDER BY 
    ranking;

-- Afficher les locations et les informations des films liés aux locations
SELECT 
    r.rental_id, 
    r.rental_date, 
    r.end_date, 
    r.user_id,
    m.title AS movie_title, 
    m.runtime AS movie_duration, 
    rt.rating_value AS movie_rating, 
    rt.review AS movie_review
FROM 
    Rental r
JOIN 
    Movie m ON r.movie_id = m.movie_id
LEFT JOIN 
    Rating rt ON r.movie_id = rt.movie_id AND r.user_id = rt.user_id;



