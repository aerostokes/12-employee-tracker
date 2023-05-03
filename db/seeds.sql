-- Seed data for dev
USE company_db;

INSERT INTO departments(name)
VALUES 
("Engineering"),
("Sales"),
("Human Resources"),
("Leadership");

INSERT INTO roles(title, salary, department_id)
VALUES
("Engineer", 100000, 1),
("Sr. Engineer", 150000, 1),
("VP Engineering", 200000, 1),
("Account Rep", 100000, 2),
("VP Sales", 250000, 2),
("COO", 350000, 4),
("CEO", 500000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
("Bourgeoisie", "Toodlesnoot", 7, NULL),
("Benjamin", "Cuckatoo", 6, 1),
("Burlington", "Moldyspore", 5, 2),
("Budapest", "Crumplehorn",4,3),
("Snorkeldink", "Frumblesnatch",3,2),
("Wimbledon", "Tennismatch", 2, 5),
("Brendadirk", "Ampersand",1, 5);
-- Seed names courtesy of https://benedictcumberbatchgenerator.tumblr.com

