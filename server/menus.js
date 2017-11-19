const express = require('express');
const db = require('../db/db');
const menuItemsRouter = require('./menuItems');

const menusRouter = express.Router();

menusRouter.get('/', (req, res, next) => {
  db.getAll('Menu')
  .then(menus =>res.status(200).send({ menus }))
  .catch(error => next(error));
});

// middleware for routes that expect an menu object on req.body
// checks whether all necessary fields are present
function validateMenu(req, res, next) {
  const reqMenu = req.body && req.body.menu;

  if (reqMenu) {
    const $title = reqMenu.title;

    if (!$title) {
      res.sendStatus(400);
      return;
    }

    req.values = { $title };
    next();
  }
}

menusRouter.post('/', validateMenu, (req, res, next) => {
  db.insert('Menu', req.values)
  .then(menu => res.status(201).send({ menu }))
  .catch(error => next(error));
});

// check whether the menu with the id from the route exists in the database
menusRouter.param('menuId', (req, res, next, id) => {
  db.getById('Menu', id)
  .then((menu) => {
    if (menu) {
      req.menuId = Number(id);
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  })
  .catch(error => next(error));
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/:menuId', (req, res, next) => {
  const menu = req.menu;
  res.status(200).send({ menu });

    // no error propagation needed as they are already taken care of in the param middleware
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  db.updateById('Menu', req.menuId, req.values)
  .then(menu => res.status(200).send({ menu }))
  .catch(error => next(error));
});

menusRouter.delete('/:menuId', (req, res, next) => {

  // if the promise resolves with a result there was a menuItem associated to the menu in question
  // and thus the menu was not deleted
  db.deleteById('Menu', req.menuId)
  .then((result) => {
    if (!result) {
      res.sendStatus(204);
    } else {
      res.sendStatus(400);
    }
  })
  .catch(error => next(error));
});

module.exports = menusRouter;
