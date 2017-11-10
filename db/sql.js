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
  if (tableName === 'Timesheet') {
    return 'hours= $hours, rate = $rate, date = $date, employee_id = $employeeId';
  }
  return 'name = $name, position = $position, wage = $wage';
}

function updateById(tableName, id) {
  return `UPDATE ${tableName} SET ${settings(tableName)} WHERE id = ${id};`;
}

function columns(tableName) {
  if (tableName === 'Timesheet') {
    return '(hours, rate, date, employee_id)';
  }
  return '(name, position, wage)';
}

function values(tableName) {
  if (tableName === 'Timesheet') {
    return '($hours, $rate, $date, $employeeId)';
  }
  return '($name, $position, $wage)';
}

function insert(tableName) {
  return `INSERT INTO ${tableName} ${columns(tableName)} VALUES ${values(tableName)};`;
}

function deleteById(tableName, id) {
  return `UPDATE ${tableName} SET is_current_employee = 0 WHERE id = ${id};`;
}

module.exports = {
  getAll,
  getAllByForeignKey,
  getById,
  updateById,
  deleteById,
  insert,
};
