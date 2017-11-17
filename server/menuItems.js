const express = require('express');
const sqlite3 = require('sqlite3');
const sql = require('../db/sql');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const menuItemsRouter = express.Router({ mergeParams: true });

menuItemsRouter.get('/', (req, res, next) => {
  db.all(sql.getAllByForeignKey('MenuItem', req.menuId),
    (error, menuItems) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ menuItems });
      next();
    });
});

// middleware for routes that expect a menuItem object on req.body
// checks whether all necessary fields are present
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
  db.run(sql.insert('MenuItem'), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('MenuItem', this.lastID),
        (error, menuItem) => {
          if (error) {
            next(error);
          }
          res.status(201).send({ menuItem });
          next();
        });
    });
});

// check whether the menuItem with the id from the route exists in the database
menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(sql.getById('MenuItem', id),
    (error, menuItem) => {
      if (error) {
        next(error);
      }
      if (menuItem) {
        req.id = id;
        req.menuItem = menuItem;
        next();
      } else {
        res.status(404).send();
      }
    });
});

menuItemsRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
  db.serialize(() => {
    db.run(sql.updateById('MenuItem', req.id), req.values,
      function (error) {
        if (error) {
          next(error);
        }
      });
    db.get(sql.getById('MenuItem', req.id),
      (error, menuItem) => {
        if (error) {
          next(error);
        }
        res.status(200).send({ menuItem });
      });
  });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(sql.deleteById('MenuItem', req.id),
    function (error) {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
});

module.exports = menuItemsRouter;
