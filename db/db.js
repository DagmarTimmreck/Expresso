// db.js implements the database access logic
// Different needs for e.g. deletion in the various tables are located here.
// It exposes the database access as promises

const sqlite3 = require('sqlite3');
const sql = require('./sql');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');

// helper function for standard error handling
function rejectError(reject) {
  return (error) => {
    if (error) {
      reject(error);
    }
  };
}

// helper function for standard error and data handling
// It is also used to pass on non-existent data to confirm successful deletion
function passOnData(resolve, reject) {
  return (error, data) => {
    if (error) {
      reject(error);
    }
    resolve(data);
  };
}

function getAll(tableName) {
  return new Promise((resolve, reject) => {
    db.all(sql.getAll(tableName), passOnData(resolve, reject));
  });
}

function getAllByForeignKey(tableName, key) {
  return new Promise((resolve, reject) => {
    db.all(sql.getAllByForeignKey(tableName, key), passOnData(resolve, reject));
  });
}

function getById(tableName, id) {
  return new Promise((resolve, reject) => {
    db.get(sql.getById(tableName, id), passOnData(resolve, reject));
  });
}

// returns the updated row wrapped in a promise
function updateById(tableName, id, values) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(sql.updateById(tableName, id), values, rejectError(reject));
      db.get(sql.getById(tableName, id), passOnData(resolve, reject));
    });
  });
}

// returns the inserted row wrapped in a promise
function insert(tableName, values) {
  return new Promise((resolve, reject) => {
    db.run(sql.insert(tableName), values,
      function (error) {
        if (error) {
          reject(error);
        }
        db.get(sql.getById(tableName, this.lastID), passOnData(resolve, reject));
      });
  });
}

// define different functions for the different requirements for deletion according to the spec
// return a promise resoved to undefined after successful deletion

// plain deletion
function deleteByIdDefault(tableName, id) {
  return new Promise((resolve, reject) => {
    db.run(sql.deleteById(tableName, id), passOnData(resolve, reject));
  });
}

// deletion by setting 'is_current_employee' to 0 as done in sql.js
function deleteByIdEmployee(tableName, id) {
  return new Promise(
    (resolve, reject) => {
      db.serialize(() => {
        db.run(sql.deleteById(tableName, id),
          (error) => {
            if (error) {
              reject(error);
            }
          });
        db.get(sql.getById(tableName, id), passOnData(resolve, reject));
      });
    });
}

// deletion only after checking that no dependent menuItems exist
// returns a promise resolved to an existing menuItem if no deletion is executed
function deleteByIdMenu(tableName, id) {
  return new Promise((resolve, reject) => {
    db.get(sql.getAllByForeignKey('MenuItem', id),
    (error, menuItem) => {
      if (error) {
        reject(error);
      }
      if (menuItem) {
        resolve(menuItem);
      } else {
        db.run(sql.deleteById(tableName, id), passOnData(resolve, reject));
      }
    });
  });
}

// prepare different delete functions for automatic selection
const deleteByIdFunctions = {
  Employee: deleteByIdEmployee,
  Menu: deleteByIdMenu,
  Timesheet: deleteByIdDefault,
  MenuItem: deleteByIdDefault,
};

function deleteById(tableName, id) {
  return deleteByIdFunctions[tableName](tableName, id);
}

module.exports = {
  getAll,
  getAllByForeignKey,
  getById,
  updateById,
  deleteById,
  insert,
};
