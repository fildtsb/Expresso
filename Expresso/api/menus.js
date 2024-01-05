const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    } else {
        const query = 'INSERT INTO Menu (title) VALUES ($title)';
        const value = {$title: title};
        db.run(query, value, function(err) {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
                    if(err){
                        next(err);
                    } else {
                        res.status(201).json({menu: menu});
                    }
                });
            }
        });
    }
});

menusRouter.get('/:menuId', (req, res, next) => {
    const menuId = req.params.menuId;

    db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId}, (err, menu) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({menu: menu});
        }
    });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const menuId = req.params.menuId;
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    } else {
        db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId}, (err, menu) => {
            if(err){
                next(err);
            } else if(!menu){
                return res.sendStatus(404);
            } else {
                const query = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
                const values = {
                    $menuId: menuId,
                    $title: title
                };
                db.run(query, values, function(err) {
                    if(err){
                        next(err);
                    } else {
                        res.status(200).json({id: menuId, title: title});
                    }
                });
            }
        });
    }
});

const checkMenuItems = (menuId, callback) => {
    const query = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = { $menuId: menuId };

    db.get(query, values, (err, menuItem) => {
        if (err) {
            callback(err);
        } else {
            callback(null, menuItem);
        }
    });
};

menusRouter.delete('/:menuId', (req, res, next) => {
    const menuId = req.params.menuId;

    checkMenuItems(menuId, (err, menuItem) => {
        if(err){
            next(err);
        } else if(menuItem){
            return res.sendStatus(400);
        } else {
            const query = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const value = {$menuId: menuId};
            db.run(query, value, function(err){
                if(err){
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;