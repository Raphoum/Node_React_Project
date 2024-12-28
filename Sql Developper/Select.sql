SELECT * FROM dataset;
select * from movie;
select * from genre;
select * from users;
select * from rental;
select * from rating;
select * from production_company;
 
SELECT 
    column_name, 
    data_type, 
    data_length, 
    data_precision, 
    data_scale
FROM 
    USER_TAB_COLUMNS
WHERE 
    table_name = 'DATASET';
    
DESC Movie;
DESC Rating;

SELECT * FROM all_tables WHERE table_name = 'MOVIE';

SELECT * FROM Movie WHERE LOWER(title) LIKE '%in%';
