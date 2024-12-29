-- Fonction qui retourne le revenue gagné grâce aux locations d'un mois donné (étant donné qu'on n'a pas assigné de prix aux films, on dit que chaque coute 10€
CREATE OR REPLACE FUNCTION Get_Monthly_Revenue(month_in DATE)
RETURN NUMBER IS
    total_revenue NUMBER;
BEGIN
    SELECT SUM(10) 
    INTO total_revenue
    FROM Rental
    WHERE TRUNC(rental_date, 'MONTH') = month_in;

    IF total_revenue IS NULL THEN
        total_revenue := 0;
    END IF;

    RETURN total_revenue; 
END;
/


SELECT Get_Monthly_Revenue(TO_DATE('2024-12-01', 'YYYY-MM-DD')) AS total_revenue
FROM dual;

-- Afficher un rapport des 12 derniers mois
SELECT 
    TO_CHAR(ADD_MONTHS(SYSDATE, 1 -LEVEL), 'YYYY-MM') AS report_month,
    Get_Monthly_Revenue(TRUNC(ADD_MONTHS(SYSDATE, 1 -LEVEL), 'MONTH')) AS total_revenue
FROM dual
CONNECT BY LEVEL <= 12;

-- Fonction qui retourne un rapport mensuel des dépenses d'un client
CREATE OR REPLACE FUNCTION Get_User_Monthly_Revenue(user_id_in NUMBER, month_in DATE)
RETURN NUMBER IS
    total_revenue NUMBER;
BEGIN
    SELECT SUM(10)
    INTO total_revenue
    FROM Rental
    WHERE user_id = user_id_in
      AND TRUNC(rental_date, 'MONTH') = month_in;

    IF total_revenue IS NULL THEN
        total_revenue := 0;
    END IF;

    RETURN total_revenue;
END;
/
SELECT
    u.name AS Users,
    Get_User_Monthly_Revenue(u.user_id,TO_DATE('2024-12-01', 'YYYY-MM-DD')) AS total_expense
FROM 
    Users u;

