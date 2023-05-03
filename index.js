require("dotenv").config();
require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
);

init();

function init() {
    //ASCII art curtesy of http://patorjk.com/software/taag/
    console.log(`
 __________________________________________________
|     ______                __                     |
|    / ____/___ ___  ____  / /___  __  _____  ___  |
|   / __/ / __ \`__ \\/ __ \\/ / __ \\/ / / / _ \\/ _ \\ |
|  / /___/ / / / / / /_/ / / /_/ / /_/ /  __/  __/ |
| /_____/_/ /_/ /_/ .___/_/\\____/\\__, /\\___/\\___/  |
|        ______  /_/           __/___/             |
|       /_  __/____ ___  _____/ /_____  _____      |
|        / / / ___/ __ \\/ ___/ // / _ \\/ ___/      |
|       / / / /  / /_/ / /__/   </  __/ /          |
|      /_/ /_/   \\__,_/\\___/_/\\_\\\\___/_/           |
|__________________________________________________|                                                
    `);
    chooseAction();

};

function chooseAction () {
    const actionArr = ["View All Departments", "View All Roles", "View All Employees", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee's Role/Manager", "Exit"];
    inquirer.prompt({
        type: "list",
        name: "nextAction",
        message: "Select Next Action: ",
        choices: actionArr,
        pageSize: actionArr.length,
    }).then(answerObj => {
        switch (answerObj.nextAction) {
            case actionArr[0]:
                viewDepartments();
                break;
            case actionArr[1]:
                viewRoles();
                break;
            case actionArr[2]:
                viewEmployees();
                break;
            case actionArr[3]:
                addDepartment();
                break;
            case actionArr[4]:
                addRole();
                break;
            case actionArr[5]:
                addEmployee();
                break;
            case actionArr[6]:
                updateEmployeeRole();
                break;
            default:
                outro();
                break;
        };
    }).catch(err => {
        console.log(err);
    });
};

function viewDepartments() {
    db.query("SELECT * FROM departments;", (err, results) => {
        if (err) { console.log("\x1b[31m", "Error reading database") };
        console.table("\x1b[36m", results);
        chooseAction();
    });
};

function viewRoles() {
    db.query("SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles LEFT JOIN departments ON department_id = departments.id; ", (err, results) => {
        if (err) { console.log("\x1b[31m", "Error reading database") };
        console.table("\x1b[36m", results);
        chooseAction();
    });
};

function viewEmployees() {
    db.query(`SELECT employees.id, employees.first_name, employees.last_name, 
    employee_role.title AS role, departments.name AS department, employee_role.salary, 
    CONCAT(managers.last_name, ", " , managers.first_name, " (", manager_role.title, ")") AS manager
    FROM employees LEFT JOIN roles AS employee_role
    ON employees.role_id = employee_role.id
    LEFT JOIN departments
    ON employee_role.department_id = departments.id
    LEFT JOIN employees AS managers
    ON employees.manager_id = managers.id
    LEFT JOIN roles AS manager_role
    ON managers.role_id = manager_role.id;`, (err, results) => {
        if (err) { console.log("\x1b[31m", "Error reading database") };
        console.table("\x1b[36m", results);
        chooseAction();
    });
};

function addDepartment() {
    inquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter Department Name: ",
    }).then(departmentObj => {
        db.query("INSERT INTO departments (name) VALUES (?);", departmentObj.name, (err, results) => {
            if (err) { console.log("\x1b[31m", "Error writing to database") };
            console.log("\x1b[36m", `${departmentObj.name} successfully added to Departments:`);
            viewDepartments();
        });
    });
};

async function addRole() {
    try {
        const departmentsPromise = await db.promise().query("SELECT * FROM departments");
        const departmentsArr = departmentsPromise[0];
        console.log(departmentsArr);
        const responsesObj = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter Role Title: ",
            }, {
                type:"input",
                name: "salary",
                message: "Enter Salary: ",
                validate:  input => { 
                    const checkExp = new RegExp(/^[0-9]+$/);
                    if (checkExp.test(input)) { return true; 
                    } else { return "Must be a number"; 
                    };
                },
            },{
                type: "list",
                name: "departmentName",
                message: "Select Department: ",
                choices: departmentsArr,
            },
        ]);
        const departmentId = departmentsArr.filter(departmentObj => departmentObj.name == responsesObj.departmentName)[0].id;
        await db.promise().query("INSERT INTO roles (title, salary, department_id) VALUES (?,?,?);", [responsesObj.title, responsesObj.salary, departmentId]);
        console.log("\x1b[36m", `${responsesObj.title} successfully added to Roles:`);
        viewRoles();
    } catch {
        console.log("\x1b[31m", "Error writing to database");
        chooseAction();
    };
};

async function addEmployee() {
    try {
        const rolesPromise = await db.promise().query("SELECT roles.id, CONCAT(departments.name, ' - ', roles.title) AS name FROM roles LEFT JOIN departments ON department_id = departments.id ORDER BY department_id;");
        const rolesArr = rolesPromise[0];
        const managersPromise = await db.promise().query("SELECT employees.id, CONCAT(last_name, ', ', first_name, ' (', title, ')') AS name FROM employees LEFT JOIN roles ON role_id = roles.id ORDER BY last_name;");
        const managersArr = managersPromise[0];
        const responsesObj = await inquirer.prompt([
            {
                type: "input",
                name: "first_name",
                message: "Enter First Name: ",
            }, {
                type: "input",
                name: "last_name",
                message: "Enter Last Name: ",
            },{
                type: "list",
                name: "roleName",
                message: "Select Role: ",
                choices: rolesArr,
            },{
                type: "list",
                name: "managerName",
                message: "Select Manager : ",
                choices: managersArr,
            },
        ]);
        const roleId = rolesArr.filter(roleObj => roleObj.name == responsesObj.roleName)[0].id;
        const managerId = managersArr.filter(managerObj => managerObj.name == responsesObj.managerName)[0].id;
        await db.promise().query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);", [responsesObj.first_name, responsesObj.last_name, roleId, managerId]);
        console.log("\x1b[36m", `${responsesObj.first_name} ${responsesObj.last_name} successfully added to Employees:`);
        viewEmployees();
    } catch {
        console.log("\x1b[31m", "Error writing to database");
        chooseAction();
    };
};

async function updateEmployeeRole() {
    try {
        const employeesPromise = await db.promise().query("SELECT employees.id, CONCAT(last_name, ', ', first_name, ' (', title, ')') AS name FROM employees LEFT JOIN roles ON role_id = roles.id ORDER BY last_name;");
        const employeesArr = employeesPromise[0];
        const rolesPromise = await db.promise().query("SELECT roles.id, CONCAT(departments.name, ' - ', roles.title) AS name FROM roles LEFT JOIN departments ON department_id = departments.id ORDER BY department_id;");
        const rolesArr = rolesPromise[0];
        const managersPromise = await db.promise().query("SELECT employees.id, CONCAT(last_name, ', ', first_name, ' (', title, ')') AS name FROM employees LEFT JOIN roles ON role_id = roles.id ORDER BY last_name;");
        const managersArr = managersPromise[0];
        const responsesObj = await inquirer.prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Select Employee to Update: ",
                choices: employeesArr,
            },{
                type: "list",
                name: "roleName",
                message: "Select New Role : ",
                choices: rolesArr,
            },{
                type: "list",
                name: "managerName",
                message: "Select New Manager : ",
                choices: managersArr,
            },
        ]);
        const employeeId = employeesArr.filter(employeeObj => employeeObj.name == responsesObj.employeeName)[0].id;
        const roleId = rolesArr.filter(roleObj => roleObj.name == responsesObj.roleName)[0].id;
        const managerId = managersArr.filter(managerObj => managerObj.name == responsesObj.managerName)[0].id;
        await db.promise().query("UPDATE employees SET role_id = ?, manager_id = ? WHERE id = ?;", [roleId, managerId, employeeId]);
        console.log("\x1b[36m", `Successfully updated:`);
        db.query(`SELECT employees.id, employees.first_name, employees.last_name, 
        employee_role.title AS role, departments.name AS department, employee_role.salary, 
        CONCAT(managers.last_name, ", " , managers.first_name, " (", manager_role.title, ")") AS manager
        FROM employees LEFT JOIN roles AS employee_role
        ON employees.role_id = employee_role.id
        LEFT JOIN departments
        ON employee_role.department_id = departments.id
        LEFT JOIN employees AS managers
        ON employees.manager_id = managers.id
        LEFT JOIN roles AS manager_role
        ON managers.role_id = manager_role.id
        WHERE employees.id = ?;`, employeeId, (err, results) => {
            // if (err) { console.log("\x1b[31m", "Error reading database") };
            console.table("\x1b[36m", results);
            chooseAction();
        });
    } catch {
        console.log("\x1b[31m", "Error writing to database");
        chooseAction();
    };
};

function outro () {
    //ASCII art curtesy of http://patorjk.com/software/taag/
    console.log(`
     ______                ____             
    / ____/___  ____  ____/ / /_  __  _____ 
   / / __/ __ \\/ __ \\/ __  / __ \\/ / / / _ \\
  / /_/ / /_/ / /_/ / /_/ / /_/ / /_/ /  __/
  \\____/\\____/\\____/\\__,_/_.___/\\__, /\\___/ 
                               /____/       
    `);
    process.exit(0);
}