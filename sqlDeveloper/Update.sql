--Mise à jour des notes des films compris dans Movie vis à vis des ratings des loueurs
UPDATE Movie m
SET 
    vote_count = vote_count + 1, -- Incrémenter le nombre de votes
    vote_average = ROUND( -- Arrondir à 3 décimales
        (TO_NUMBER(m.vote_average) * m.vote_count + 
            (
                SELECT r.rating_value
                FROM Rating r
                WHERE r.movie_id = m.movie_id
                  AND r.rating_id = (SELECT MAX(rating_id) FROM Rating WHERE movie_id = m.movie_id)
            )
        ) / (m.vote_count + 1),
        3
    ) -- Recalculer la moyenne avec la nouvelle note
WHERE EXISTS (
    SELECT 1 
    FROM Rating r 
    WHERE r.movie_id = m.movie_id
);

--UPDATE users SET email = 'adrienservas@exemple.com' WHERE user_id = 1;


SET AUTOCOMMIT ON;

commit;

ROLLBACK;
