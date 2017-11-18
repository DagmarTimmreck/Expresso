// db-util implements the database access logic
// Different needs for e.g. deletion in the various tables are located here.
// It exposes the database access as promises

const sqlite3 = require('sqlite3');
const sql = require('./sql');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');

function getAll(tableName) {
  return new Promise((resolve, reject) => {
    db.all(sql.getAll(tableName),
      (error, rows) => {
        if (error) {
          reject(error);
        }
        resolve(rows);
      });
  });
}

function getAllByForeignKey(tableName, key) {
  return new Promise((resolve, reject) => {
    db.all(sql.getAllByForeignKey(tableName, key),
      (error, rows) => {
        if (error) {
          reject(error);
        }
        resolve(rows);
      });
  });
}

function getById(tableName, id) {
  return new Promise((resolve, reject) => {
    db.get(sql.getById(tableName, id),
      (error, row) => {
        if (error) {
          reject(error);
        }
        resolve(row);
      });
  });
}

// returns the updated row wrapped in a promise
function updateById(tableName, id, values) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(sql.updateById(tableName, id), values,
        (error) => {
          if (error) {
            reject(error);
          }
        });
      db.get(sql.getById(tableName, id),
        (error, row) => {
          if (error) {
            reject(error);
          }
          resolve(row);
        });
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
        db.get(sql.getById(tableName, this.lastID),
          (error, row) => {
            if (error) {
              reject(error);
            }
            resolve(row);
          });
      });
  });
}

// returns the 'deleted row' (either marked as deleted or empty) wrapped in a promise
// should behave differently for the different tables -> deleteById maps to an Array of different methods


function deleteById(tableName, id) {
  if (tableName === 'Employee') {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(sql.deleteById(tableName, id),
          (error) => {
            if (error) {
              reject(error);
            }
          });
        db.get(sql.getById(tableName, id),
          (error, row) => {
            if (error) {
              reject(error);
            }
            resolve(row);
          });
      });
    });
  }
  if (tableName === 'Menu') {
    return new Promise((resolve, reject) => {
      db.getAllByForeignKey('MenuItem', id)
      .then((menuItem) => {
        if (menuItem) {
          resolve(false);
        }
        db.run(sql.deleteById(tableName, id),
          (error) => {
            if (error) {
              reject(error);
            }
            resolve(null);
          });
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.run(sql.deleteById(tableName, id),
      (error) => {
        if (error) {
          reject(error);
        }
        resolve({});
      });
  });
}

module.exports = {
  getAll,
  getAllByForeignKey,
  getById,
  updateById,
  deleteById,
  insert,
};
