const toCamelCase = require('to-camel-case');

const dbStructure = {
  Employee: ['name', 'position', 'wage'],
  Timesheet: ['hours', 'rate', 'date', 'employee_id'],
};

function getAll(tableName) {
  return `SELECT * FROM ${tableName} WHERE is_current_employee = 1;`;
}

function getAllByForeignKey(tableName, key) {
  return `SELECT * FROM ${tableName} WHERE employee_id = ${key};`;
}

function getById(tableName, id) {
  return `SELECT * FROM ${tableName} WHERE id = ${id};`;
}

function settings(tableName) {
  return dbStructure[tableName].map(columnName => `${columnName} = $${toCamelCase(columnName)}`).join(', ');
}

function updateById(tableName, id) {
  return `UPDATE ${tableName} SET ${settings(tableName)} WHERE id = ${id};`;
}

function columns(tableName) {
  return dbStructure[tableName].join(', ');
}

function values(tableName) {
  return dbStructure[tableName].map(columnName => `$${toCamelCase(columnName)}`).join(', ');
}

function insert(tableName) {
  return `INSERT INTO ${tableName} (${columns(tableName)}) VALUES (${values(tableName)});`;
}

function deleteById(tableName, id) {
  if (tableName === 'Employee') {
    return `UPDATE ${tableName} SET is_current_employee = 0 WHERE id = ${id};`;
  }
  if (tableName === 'Timesheet') {
    return `DELETE FROM ${tableName} WHERE id = ${id};`;
  }
}

module.exports = {
  getAll,
  getAllByForeignKey,
  getById,
  updateById,
  deleteById,
  insert,
};
