const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const employeesRouter = express.Router();

employeesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
  db.all(sql,
    (error, rows) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ employees: rows });
    });
});

employeesRouter.post('/', (req, res, next) => {
  const newEmployee = req.body && req.body.employee;

  if (newEmployee) {
    const name = newEmployee.name;
    const position = newEmployee.position;
    const wage = newEmployee.wage;

    if (!name || !position || !wage) {
      return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)';
    const values = {
      $name: name,
      $position: position,
      $wage: wage,
    };
    db.run(sql, values,
      function (error) {
        if (error) {
          next(error);
        }
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
          (error, row) => {
            res.status(201).send({ employee: row });
          });
      });
  }
});

module.exports = employeesRouter;
