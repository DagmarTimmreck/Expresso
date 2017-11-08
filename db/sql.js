function getAll(tableName) {
  return `SELECT * FROM ${tableName} WHERE is_current_employee = 1;`;
}

function getAllByForeignKey(tableName, key) {
  return `SELECT * FROM ${tableName} WHERE employee_id = ${key};`;
}

function getById(tableName, id) {
  return `SELECT * FROM ${tableName} WHERE id = ${id};`;
}

function settings() {
  return 'name = $name, position = $position, wage = $wage';
}

function updateById(tableName, id) {
  return `UPDATE ${tableName} SET ${settings()} WHERE id = ${id};`;
}

function columns() {
  return '(name, position, wage)';
}

function values() {
  return '($name, $position, $wage)';
}

function insert(tableName) {
  return `INSERT INTO ${tableName} ${columns()} VALUES ${values()};`;
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
