-- Active: 1682615646290@@127.0.0.1@3306@company_db
USE company_db;
SELECT * FROM departments;
SELECT roles.*, departments.name 
FROM roles LEFT JOIN departments
ON department_id = departments.id
ORDER BY department_id, roles.salary;
SELECT employees.id, employees.first_name, employees.last_name, 
employees.role_id, employee_role.title, employee_role.salary,
employee_role.department_id, departments.name, 
employees.manager_id, 
CONCAT(managers.last_name, ", " , managers.first_name, " (", manager_role.title, ")"
) AS manager
FROM employees LEFT JOIN roles AS employee_role
ON employees.role_id = employee_role.id
LEFT JOIN departments
ON employee_role.department_id = departments.id
LEFT JOIN employees AS managers
ON employees.manager_id = managers.id
LEFT JOIN roles AS manager_role
ON managers.role_id = manager_role.id;



INSERT INTO departments (name) VALUES ("Test Department");
DELETE FROM departments WHERE id = 5;

INSERT INTO roles (title, salary, department_id) VALUES ("Test Role", 0, 1);
DELETE FROM roles WHERE id = 8;

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Test", "Empolyee", 1, 3);
DELETE FROM employees WHERE id = 8;
UPDATE employees SET role_id = 2 WHERE id = 7;