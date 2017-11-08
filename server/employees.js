const express = require('express');
const sqlite3 = require('sqlite3');
const sql = require('../db/sql');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const employeesRouter = express.Router();

employeesRouter.get('/', (req, res, next) => {
  db.all(sql.getAll('Employee'),
    (error, rows) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ employees: rows });
      next();
    });
});

function validateEmployee(req, res, next) {
  const reqEmployee = req.body && req.body.employee;

  if (reqEmployee) {
    const name = reqEmployee.name;
    const position = reqEmployee.position;
    const wage = reqEmployee.wage;

    if (!name || !position || !wage) {
      res.sendStatus(400);
      return;
    }

    req.values = {
      $name: name,
      $position: position,
      $wage: wage,
    };
    next();
  }
}

function getEmployeeById(req, res, next) {
  
}

employeesRouter.post('/', validateEmployee, (req, res, next) => {
  db.run(sql.insert('Employee'), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('Employee', this.lastID),
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).send({ employee: row });
          next();
        });
    });
});

employeesRouter.param('employeeId', (req, res, next, id) => {
  db.get(sql.getById('Employee', id),
    (error, employee) => {
      if (error) {
        next(error);
      }
      if (employee) {
        req.id = id;
        req.employee = employee;
        next();
      } else {
        res.status(404).send();
      }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({ employee: req.employee });
  next();
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  db.run(sql.updateById('Employee', req.id), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('Employee', req.id),
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(200).send({ employee: row });
        });
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(sql.deleteById('Employee', req.id),
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(sql.getById('Employee', req.id),
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(200).send({ employee: row });
        });
      }
    });
});

module.exports = employeesRouter;
