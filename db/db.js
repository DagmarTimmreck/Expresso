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
          return reject(error);
        }
        return resolve(rows);
      });
  });
}

function getById(tableName, id) {
  return new Promise((resolve, reject) => {
    db.get(sql.getById('Employee', id),
      (error, row) => {
        if (error) {
          return reject(error);
        }
        return resolve(row);
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
            return reject(error);
          }
        });
      db.get(sql.getById(tableName, id),
        (error, row) => {
          if (error) {
            return reject(error);
          }
          return resolve(row);
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
          return reject(error);
        }
        db.get(sql.getById(tableName, this.lastID),
          (error, row) => {
            if (error) {
              return reject(error);
            }
            return resolve(row);
          });
      });
  });
}

// returns the 'deleted row' (either marked as deleted or empty) wrapped in a promise
function deleteById(tableName, id) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(sql.deleteById(tableName, id),
        function (error) {
          if (error) {
            return reject(error);
          }
        });
      db.get(sql.getById(tableName, id),
        (error, row) => {
          if (error) {
            return reject(error);
          }
          return resolve(row);
        });
    });
  });
}

module.exports = {
  getAll,
    // getAllByForeignKey,
  getById,
  updateById,
  deleteById,
  insert,
};
