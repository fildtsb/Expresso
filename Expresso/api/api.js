const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees.js');
const timesheetsRouter = require('./timesheets.js');
const menusRouter = require('./menus.js');
const menuItemsRouter = require('./menuItems.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees/:employeeId/timesheets', timesheetsRouter);
apiRouter.use('/menus/:menuId/menu-items', menuItemsRouter);

module.exports = apiRouter;