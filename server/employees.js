const express = require('express');
const sqlite3 = require('sqlite3');
const sql = require('../db/sql');
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const employeesRouter = express.Router();

employeesRouter.get('/', (req, res, next) => {
  db.all(sql.getAll('Employee'),
    (error, employees) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ employees });
      next();
    });
});

// middleware for routes that expect an employee object on req.body
// checks whether all necessary fields are present
function validateEmployee(req, res, next) {
  const reqEmployee = req.body && req.body.employee;

  if (reqEmployee) {
    const $name = reqEmployee.name;
    const $position = reqEmployee.position;
    const $wage = reqEmployee.wage;

    if ($name && $position && $wage) {
      req.values = {
        $name,
        $position,
        $wage,
      };
      next();
    } else {
      res.sendStatus(400);
    }
  }
}

employeesRouter.post('/', validateEmployee, (req, res, next) => {
  db.run(sql.insert('Employee'), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      req.employeeId = this.lastID;
      db.get(sql.getById('Employee', req.employeeId),
        (error, employee) => {
          if (error) {
            next(error);
          }
          res.status(201).send({ employee });
          next();
        });
    });
});

// check whether the employee with the id from the route exists in the database
employeesRouter.param('employeeId', (req, res, next, id) => {
  db.get(sql.getById('Employee', id),
    (error, employee) => {
      if (error) {
        next(error);
      }
      if (employee) {
        req.employeeId = Number(id);
        req.employee = employee;
        next();
      } else {
        res.status(404).send();
      }
    });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/:employeeId', (req, res, next) => {
  const employee = req.employee;
  res.status(200).send({ employee });
  next();
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  db.serialize(() => {
    db.run(sql.updateById('Employee', req.employeeId), req.values,
      (error) => {
        if (error) {
          next(error);
        }
      });
    db.get(sql.getById('Employee', req.employeeId),
      (error, employee) => {
        if (error) {
          next(error);
        }
        res.status(200).send({ employee });
      });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.serialize(() => {
    db.run(sql.deleteById('Employee', req.employeeId),
      function (error) {
        if (error) {
          next(error);
        }
      });
    db.get(sql.getById('Employee', req.employeeId),
      (error, employee) => {
        if (error) {
          next(error);
        }
        res.status(200).send({ employee });
      });
  });
});

module.exports = employeesRouter;
