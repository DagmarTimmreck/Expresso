const express = require('express');
const db = require('../db/db');

const timesheetsRouter = express.Router({ mergeParams: true });

timesheetsRouter.get('/', (req, res, next) => {
  db.getAllByForeignKey('Timesheet', req.employeeId)
  .then((timesheets) => {
    res.status(200).send({ timesheets });
    next();
  })
  .catch(error => next(error));
});

// middleware for routes that expect a timesheet object on req.body
// checks whether all necessary fields are present
// and prepares them for sql
function validateTimesheet(req, res, next) {
  const reqTimesheet = req.body && req.body.timesheet;

  if (reqTimesheet) {
    const $hours = reqTimesheet.hours;
    const $date = reqTimesheet.date;
    const $rate = reqTimesheet.rate;
    const $employeeId = reqTimesheet.employeeId || (req.timesheet && req.timesheet.employee_id) || req.employeeId;
    const $id = reqTimesheet.id || req.timesheetId;

    if (!$hours || !$date || !$rate || $employeeId !== req.employeeId || $id !== req.timesheetId) {
      res.sendStatus(400);
      return;
    }

    req.values = {
      $hours,
      $date,
      $rate,
      $employeeId,
    };
    next();
  }
}

timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {
  req.values.$employeeId = req.employeeId;
  db.insert('Timesheet', req.values)
  .then((timesheet) => {
    res.status(201).send({ timesheet });
    next();
  })
  .catch(error => next(error));
});

// check whether the timesheet with the id from the route exists in the database
timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.getById('Timesheet', id)
  .then((timesheet) => {
    if (timesheet) {
      req.timesheetId = Number(id);
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    }
  })
  .catch(error => next(error));
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  db.updateById('Timesheet', req.timesheetId, req.values)
  .then((timesheet) => {
    res.status(200).send({ timesheet });
  })
  .catch(error => next(error));
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.deleteById('Timesheet', req.timesheetId)
  .then(() => {
    res.sendStatus(204);
  })
  .catch(error => next(error));
});

module.exports = timesheetsRouter;
