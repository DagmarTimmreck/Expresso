const express = require('express');
const db = require('../db/db');

const menuItemsRouter = express.Router({ mergeParams: true });

menuItemsRouter.get('/', (req, res, next) => {
  db.getAllByForeignKey('MenuItem', req.menuId)
  .then(menuItems => res.status(200).send({ menuItems }))
  .catch(error => next(error));
});

// middleware for routes that expect a timesheet object on req.body
// checks whether all necessary fields are present and consistent within route, request.body and database where applicable
// and prepares them for sql
function validateMenuItem(req, res, next) {
  const reqMenuItem = req.body && req.body.menuItem;

  if (reqMenuItem) {
    const $name = reqMenuItem.name;
    const $description = reqMenuItem.description;
    const $inventory = reqMenuItem.inventory;
    const $price = reqMenuItem.price;
    const $menuId = reqMenuItem.menuId || (req.menuItem && req.menuItem.menu_id) || req.menuId;
    const $id = reqMenuItem.id || req.id;

    if (!$name || !$description || !$inventory || !$price || $menuId !== req.menuId || $id !== req.id) {
      res.sendStatus(400);
      return;
    }

    req.values = {
      $name,
      $description,
      $inventory,
      $price,
      $menuId,
    };
    next();
  }
}

menuItemsRouter.post('/', validateMenuItem, (req, res, next) => {
  req.values.$menuId = req.menuId;
  db.insert('MenuItem', req.values)
  .then(menuItem => res.status(201).send({ menuItem }))
  .catch(error => next(error));
});

// check whether the menuItem with the id from the route exists in the database
menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  db.getById('MenuItem', id)
  .then((menuItem) => {
    if (menuItem) {
      req.id = id;
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send();
    }
  })
  .catch(error => next(error));
});

// no individual get route according to spec

menuItemsRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
  db.updateById('MenuItem', req.id, req.values)
  .then(menuItem => res.status(200).send({ menuItem }))
  .catch(error => next(error));
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.deleteById('MenuItem', req.id)
  .then(() => res.sendStatus(204))
  .catch(error => next(error));
});

module.exports = menuItemsRouter;
