const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employees WHERE Employees.is_current_employee = 1', (err, employees) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    const query = "INSERT INTO Employees (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee);";
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };
    db.run(query, values, function(err) {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employees.id = ${this.lastID}`, (err, employee) => {
                res.status(201).json({employee: employee});
            });
        };
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    const employeeId = req.params.employeeId;

    db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
        if(err){
            next(err);
        } else if(!employee){
            return res.sendStatus(404);
        } else {
            res.status(200).json({ employee: employee });
        }
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const employeeId = req.params.employeeId;
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }
    db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
        if (err) {
            next(err);
        } else if (!employee) {
            return res.sendStatus(404);
        } else {
            const query = 'UPDATE Employees SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employees.id = $employeeId';
            const values = {
                $name: name,
                $position: position,
                $wage: wage,
                $isCurrentEmployee: isCurrentEmployee,
                $employeeId: employeeId
            };
            db.run(query, values, function(err) {
                if(err){
                    next(err);
                } else {
                    res.status(200).json({ employee: req.body.employee });
                }
            });
        }
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const employeeId = req.params.employeeId;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    
    db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
        if (err) {
            next(err);
        } else if (!employee) {
            return res.sendStatus(404);
        } else {
            const query = 'UPDATE Employees SET is_current_employee = 0 WHERE Employees.id = $employeeId';
            const values = {
                $isCurrentEmployee: isCurrentEmployee,
                $employeeId: employeeId
            };
            db.run(query, values, function(err){
                if(err){
                    next(err);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

module.exports = employeesRouter;