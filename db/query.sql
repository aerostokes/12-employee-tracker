-- Queries used during dev 
USE company_db; 
SELECT * FROM departments; 
SELECT roles.id, roles.title, departments.name AS department, roles.salary 
FROM roles LEFT JOIN departments ON department_id = departments.id; 
SELECT employees.id, employees.first_name, employees.last_name, 
employee_role.title AS role, departments.name AS department, employee_role.salary, 
CONCAT(managers.last_name, ', ' , managers.first_name, ' (', manager_role.title, ')') AS manager
FROM employees LEFT JOIN roles AS employee_role
ON employees.role_id = employee_role.id
LEFT JOIN departments
ON employee_role.department_id = departments.id
LEFT JOIN employees AS managers
ON employees.manager_id = managers.id
LEFT JOIN roles AS manager_role
ON managers.role_id = manager_role.id;


INSERT INTO departments (name) VALUES ('Test Department');

INSERT INTO roles (title, salary, department_id) VALUES ('Test Role', 0, 1);

SELECT roles.id, CONCAT(departments.name, '  -  ', roles.title) AS name FROM roles LEFT JOIN departments ON department_id = departments.id ORDER BY department_id; 
SELECT employees.id, CONCAT(last_name, ', ', first_name, ' (', title, ')') AS name FROM employees LEFT JOIN roles ON role_id = roles.id ORDER BY last_name;
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('Test', 'Empolyee', 1, 3);
UPDATE employees SET role_id = 2, manager_id = 4 WHERE id = 7;

DELETE FROM departments WHERE id = 5;
DELETE FROM roles WHERE id = 8;
DELETE FROM employees WHERE id = 8;


