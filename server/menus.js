const express = require('express');
const sqlite3 = require('sqlite3');
const sql = require('../db/sql');
const menuItemsRouter = require('./menuItems');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db/database.sqlite');
const menusRouter = express.Router();

menusRouter.get('/', (req, res, next) => {
  db.all(sql.getAll('Menu'),
    (error, menus) => {
      if (error) {
        next(error);
      }
      res.status(200).send({ menus });
      next();
    });
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
  db.run(sql.insert('Menu'), req.values,
    function (error) {
      if (error) {
        next(error);
      }
      db.get(sql.getById('Menu', this.lastID),
        (error, menu) => {
          if (error) {
            next(error);
          }
          res.status(201).send({ menu });
          next();
        });
    });
});

// check whether the menu with the id from the route exists in the database
menusRouter.param('menuId', (req, res, next, id) => {
  db.get(sql.getById('Menu', id),
    (error, menu) => {
      if (error) {
        next(error);
      }
      if (menu) {
        req.menuId = Number(id);
        req.menu = menu;
        next();
      } else {
        res.status(404).send();
      }
    });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/:menuId', (req, res, next) => {
  const menu = req.menu;
  res.status(200).send({ menu });
  next();
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  db.serialize(() => {
    db.run(sql.updateById('Menu', req.menuId), req.values,
      function (error) {
        if (error) {
          next(error);
        }
      });
    db.get(sql.getById('Menu', req.menuId),
      (error, menu) => {
        if (error) {
          next(error);
        }
        res.status(200).send({ menu });
      });
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(sql.getAllByForeignKey('MenuItem', req.menuId),
    (error, menuItem) => {
      if (error) {
        next(error);
      }
      if (!menuItem) {
        db.run(sql.deleteById('Menu', req.menuId),
        (error) => {
          if (error) {
            next(error);
          }
          res.sendStatus(204);
          next();
        });
      } else {
        res.sendStatus(400);
      }
    });
});

module.exports = menusRouter;
