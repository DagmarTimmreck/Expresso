function getAll(tableName) {
  return `SELECT * FROM ${tableName} WHERE is_current_employee = 1;`;
}

function getById(tableName, id) {
  return `SELECT * FROM ${tableName} WHERE id = ${id};`;
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

module.exports = {
  getAll,
  getById,
  insert,
};