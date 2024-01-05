const express = require('express');
const menuItemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const checkMenuExists = (req, res, next) => {
    const menuId = req.params.menuId;
    const query = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const value = { $menuId: menuId };

    db.get(query, value, (err, menu) => {
        if(err){
            next(err);
        } else if(!menu){
            res.sendStatus(404);
        } else {
            next();
        }
    });
};

menuItemsRouter.get('/', checkMenuExists, (req, res, next) => {
    const menuId = req.params.menuId;
    const query = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const value = { $menuId: menuId };

    db.all(query, value, (err, menuItems) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post('/', checkMenuExists, (req, res, next) => {
    const menuId = req.params.menuId;
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !inventory || !price){
        return res.sendStatus(400);
    } else {
        const query = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        };
        db.run(query, values, function(err){
            if(err){
                next(err);
            } else {
                const newId = this.lastID;
                res.status(201).json({
                    menuItem: {
                        id: newId,
                        name: name,
                        description: description,
                        inventory: inventory,
                        price: price,
                        menu_id: menuId
                    }
                });
            }
        })
    }
});

const checkMenuItemExists = (req, res, next) => {
    const menuItemId = req.params.menuItemId;
    const query = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const value = { $menuItemId: menuItemId };

    db.get(query, value, (err, menuItem) => {
        if(err){
            next(err);
        } else if(!menuItem){
            res.sendStatus(404);
        } else {
            next();
        }
    });
};

menuItemsRouter.put('/:menuItemId', checkMenuExists, checkMenuItemExists, (req, res, next) => {
    const menuItemId = req.params.menuItemId;
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !inventory || !price){
        return res.sendStatus(400);
    } else {
        const query = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuItemId: menuItemId
        };
        db.run(query, values, function(err) {
            if(err){
                next(err);
            } else {
                res.status(200).json({
                    id: menuItemId,
                    name: name,
                    description: description,
                    inventory: inventory,
                    price: price                    
                });
            }
        });
    }
});

menuItemsRouter.delete('/:menuItemId', checkMenuExists, checkMenuItemExists, (req, res, next) => {
    const menuItemId = req.params.menuItemId;

    const query = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const value = {$menuItemId: menuItemId};

    db.run(query, value, function(err) {
        if(err){
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = menuItemsRouter;