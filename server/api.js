const express = require('express');

const apiRouter = express.Router();

const employeesRouter = require('./employees.js');

apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;
