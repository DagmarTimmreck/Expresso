const express = require('express');
const sqlite3 = require('sqlite3');
const sql = require('../db/sql');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const timesheetsRouter = express.Router({ mergeParams: true });

timesheetsRouter.get('/', (req, res, next) => {
  db.all(sql.getAllByForeignKey('Timesheet', req.employeeId),
    (error, timesheets) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ timesheets });
      next();
    });
});

// middleware for routes that expect a timesheet object on req.body
// checks whether all necessary fields are present
function validateTimesheet(req, res, next) {
  const reqTimesheet = req.body && req.body.timesheet;

  if (reqTimesheet) {
    const $hours = reqTimesheet.hours;
    const $date = reqTimesheet.date;
    const $rate = reqTimesheet.rate;
    const $employeeId = reqTimesheet.employeeId || (req.timesheet && req.timesheet.employee_id) || req.employeeId;
    const $id = reqTimesheet.id || req.id;

    if (!$hours || !$date || !$rate || $employeeId !== req.employeeId || $id !== req.id) {
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
  db.run(sql.insert('Timesheet'), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('Timesheet', this.lastID),
        (err, timesheet) => {
          if (err) {
            next(err);
          }
          res.status(201).send({ timesheet });
          next();
        });
    });
});

// check whether the timesheet with the id from the route exists in the database
timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get(sql.getById('Timesheet', id),
    (error, timesheet) => {
      if (error) {
        next(error);
      }
      if (timesheet) {
        req.id = id;
        req.timesheet = timesheet;
        next();
      } else {
        res.status(404).send();
      }
    });
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  db.run(sql.updateById('Timesheet', req.id), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('Timesheet', req.id),
        (err, timesheet) => {
          if (err) {
            next(err);
          }
          res.status(200).send({ timesheet });
        });
    });
});

// timesheetsRouter.delete('/:employeeId', (req, res, next) => {
//   db.run(sql.deleteById('Timesheet', req.id),
//     function (error) {
//       if (error) {
//         next(error);
//       } else {
//         db.get(sql.getById('Timesheet', req.id),
//         (err, timesheet) => {
//           if (err) {
//             next(err);
//           }
//           res.status(200).send({ employee: timesheet });
//         });
//       }
//     });
// });

module.exports = timesheetsRouter;
