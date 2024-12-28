-- Procedure qui crée un rapport pour un mois donné.
CREATE OR REPLACE PROCEDURE Generate_Monthly_Report (month_in DATE) IS
BEGIN
    DELETE FROM Monthly_Report
    WHERE report_month = month_in;

    INSERT INTO Monthly_Report (report_month, movie_id, title, vote_average, popularity)
    SELECT 
        month_in AS report_month,
        r.movie_id, 
        m.title, 
        AVG(rat.rating_value) AS avg_rating,
        m.popularity
    FROM 
        Rental r
    JOIN 
        Movie m ON r.movie_id = m.movie_id
    JOIN 
        Rating rat ON rat.movie_id = r.movie_id
    WHERE 
        TRUNC(r.rental_date, 'MONTH') = month_in 
    GROUP BY 
        r.movie_id, m.title, m.popularity
    ORDER BY 
        AVG(rat.rating_value) DESC
    FETCH FIRST 5 ROWS ONLY;  
END;
/

BEGIN
    Generate_Monthly_Report(TO_DATE('2024-12-01', 'YYYY-MM-DD'));
END;

Select * from monthly_report;