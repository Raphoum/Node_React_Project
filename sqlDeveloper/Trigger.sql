-- Mettre a jour les ratings des films en fonction des notes 
CREATE OR REPLACE TRIGGER update_movie_rating
AFTER INSERT ON Rating
FOR EACH ROW
BEGIN
    UPDATE Movie m
    SET 
        vote_count = vote_count + 1, -- Incrémenter le nombre de votes
        vote_average = ROUND( -- Arrondir à 3 décimales
            (TO_NUMBER(m.vote_average) * m.vote_count + :NEW.rating_value) / 
            (m.vote_count + 1),
            3
        )
    WHERE m.movie_id = :NEW.movie_id;
END;
/

-- Supprimer tous les liens d'un user quand il est supprimé
CREATE OR REPLACE TRIGGER trg_delete_user_dependencies
AFTER DELETE ON Users
FOR EACH ROW
BEGIN
    DELETE FROM Rental
    WHERE user_id = :OLD.user_id;
    DELETE FROM Rating
    WHERE user_id = :OLD.user_id;
END;
/

--Empecher un user de louer un meme film en meme temps
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_rental
BEFORE INSERT ON Rental
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM Rental
    WHERE user_id = :NEW.user_id
      AND movie_id = :NEW.movie_id
      AND end_date > SYSDATE;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cet utilisateur a déjà loué ce film actuellement.');
    END IF;
END;
/
SET AUTOCOMMIT ON;

ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '. ';

