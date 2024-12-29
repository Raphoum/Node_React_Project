-- Création de roles qui serviront à être distribué aux users
CREATE ROLE role_admin;
CREATE ROLE role_manager;
CREATE ROLE role_user;

-- Role admin
GRANT ALL PRIVILEGES ON Movie TO role_admin;
GRANT ALL PRIVILEGES ON Genre TO role_admin;
GRANT ALL PRIVILEGES ON Movie_Genre TO role_admin;
GRANT ALL PRIVILEGES ON Users TO role_admin;
GRANT ALL PRIVILEGES ON Rental TO role_admin;
GRANT ALL PRIVILEGES ON Rating TO role_admin;
GRANT ALL PRIVILEGES ON Production_Company TO role_admin;
GRANT ALL PRIVILEGES ON Movie_Production_Company TO role_admin;

--Role manager
        -- Lecture sur toutes les tables
GRANT SELECT ON Genre TO role_manager;
GRANT SELECT ON Movie_Genre TO role_manager;
GRANT SELECT ON Production_Company TO role_manager;
GRANT SELECT ON Movie_Production_Company TO role_manager;

        -- Insertion et mise à jour sur des tables spécifiques
GRANT INSERT, UPDATE, DELETE, SELECT ON Movie TO role_manager;
GRANT INSERT, UPDATE, DELETE, SELECT ON Users TO role_manager;
GRANT INSERT, UPDATE, DELETE, SELECT ON Rental TO role_manager;
GRANT INSERT, UPDATE, DELETE, SELECT ON Rating TO role_manager;

-- Role user
        -- Lecture seule
GRANT SELECT ON Movie TO role_user;
GRANT SELECT ON Genre TO role_user;
GRANT SELECT ON Movie_Genre TO role_user;
GRANT SELECT ON Users TO role_user;
GRANT SELECT ON Rental TO role_user;
GRANT SELECT ON Rating TO role_user;
GRANT SELECT ON Production_Company TO role_user;
GRANT SELECT ON Movie_Production_Company TO role_user;


-- Création des utilisateurs
CREATE USER admin IDENTIFIED BY admin_password;
CREATE USER manager IDENTIFIED BY manager_password;
CREATE USER user_app IDENTIFIED BY user_password;

-- Donner la permission de se connecter à la base
GRANT CREATE SESSION TO admin;
GRANT CREATE SESSION TO manager;
GRANT CREATE SESSION TO user_app;

-- Attribution des rôles
GRANT role_admin TO admin;
GRANT role_manager TO manager;
GRANT role_user TO user_app;

ALTER SESSION SET CONTAINER = XEPDB1;
--ALTER SESSION SET CONTAINER = CDB$ROOT;

show CON_NAME;