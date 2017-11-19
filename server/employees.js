const express = require('express');
const db = require('../db/db');
const timesheetsRouter = require('./timesheets');

const employeesRouter = express.Router();


employeesRouter.get('/', (req, res, next) => {
  db.getAll('Employee')
    .then(employees => res.status(200).send({ employees }))
    .catch(error => next(error));
});

// middleware for routes that expect an employee object on req.body
// checks whether all necessary fields are present
// and prepares them as values for sql
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
  db.insert('Employee', req.values)
  .then(employee => res.status(201).send({ employee }))
  .catch(error => next(error));
});

// check whether the employee with the id from the route exists in the database
employeesRouter.param('employeeId', (req, res, next, id) => {
  db.getById('Employee', id)
  .then((employee) => {
    if (employee) {
      req.employeeId = Number(id);
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    }
  })
  .catch(error => next(error));
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/:employeeId', (req, res, next) => {
  const employee = req.employee;
  res.status(200).send({ employee });

  // no error propagation needed as they are already taken care of in the param middleware
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  db.updateById('Employee', req.employeeId, req.values)
  .then(employee => res.status(200).send({ employee }))
  .catch(error => next(error));
});

employeesRouter.delete('/:employeeId', (req, res, next) => {

  // the employee is not deleted from the database but set to 'is_current_employee = 0'
  // so the response with the updated employee database entry is sent
  db.deleteById('Employee', req.employeeId)
  .then(employee => res.status(200).send({ employee }))
  .catch(error => next(error));
});

module.exports = employeesRouter;
