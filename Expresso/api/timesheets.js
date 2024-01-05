const express = require('express');
const timesheetsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
    const employeeId = req.params.employeeId;

    db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
        if(err){
            next(err);
        } else if(!employee){
            return res.sendStatus(404);
        } else {
            db.all('SELECT * FROM Timesheets WHERE Timesheets.employee_id = $employeeId', {$employeeId: employeeId}, (err, timesheets) => {
                if(err){
                    next(err);
                } else {
                    res.sendStatus(200).json({timesheets: timesheets});
                }
            });
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheets.hours;
    const rate = req.body.timesheets.rate;
    const date = req.body.timesheets.date;
    const employeeId = req.params.employeeId;

    if(!hours || !rate || !date){
        return res.sendStatus(400);
    } else {
        db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
            if(err){
                next(err);
            } else if(!employee){
                return res.sendStatus(404);
            } else {
                const query = 'INSERT INTO Timesheets (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
                const values = {
                    $hours: hours,
                    $rate: rate,
                    $date: date,
                    $employeeId: employeeId
                };
                db.run(query, values, function(err) {
                    if(err){
                        next(err);
                    } else {
                        const newId = this.lastID;
                        res.status(201).json({
                            timesheet: {
                                id: newId,
                                hours: hours,
                                rate: rate,
                                date: date,
                                employee_id: employeeId,
                            }
                        });

                    }
                });
            }
        });
    }
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const timesheetId = req.params.timesheetId;
    const hours = req.body.timesheets.hours;
    const rate = req.body.timesheets.rate;
    const date = req.body.timesheets.date;
    const employeeId = req.params.employeeId;

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    } else {
        db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
            if(err){
                next(err);
            } else if(!employee){
                return res.sendStatus(404);
            } else {
                const query = 'UPDATE Timesheets SET hours = $hours, rate = $rate, date = $date WHERE Timesheets.id = $timesheetId';
                const values = {
                    $hours: hours,
                    $rate: rate,
                    $date: date,
                    $timesheetId: timesheetId
                };
                db.run(query, values, function(err) {
                    if(err){
                        next(err);
                    } else {
                        res.status(200).json({
                            timesheet: {
                                id: timesheetId,
                                hours: hours,
                                rate: rate,
                                date: date,
                                employee_id: employeeId,
                            }
                        });
                    }
                });
            }
        });
    }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const timesheetId = req.params.timesheetId;
    const employeeId = req.params.employeeId;

    db.get('SELECT * FROM Employees WHERE Employees.id = $employeeId', {$employeeId: employeeId}, (err, employee) => {
        if(err){
            next(err);
        } else if(!employee){
            return res.sendStatus(404);
        } else {
            db.get('SELECT * FROM Timesheets WHERE Timesheets.id = $timesheetId', {$timesheetId: timesheetId}, (err, timesheet) => {
                if(err){
                    next(err);
                } else if(!timesheet){
                    return res.sendStatus(404);
                } else {
                    const query = 'DELETE FROM Timesheets WHERE Timesheets.id = $timesheetId';
                    const value = {$timesheetId: timesheetId};
                    db.run(query, value, function(err) {
                        if(err){
                            next(err);
                        } else {
                            res.sendStatus(204);
                        }
                    });
                }
            });
        }
    });
});



module.exports = timesheetsRouter;