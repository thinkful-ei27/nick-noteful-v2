'use strict';
const express = require('express');
const knex = require('../knex');

const router = express.Router();


//GET ALL FOLDERS (no search filter)
router.get('/', (req, res, next) => {
    const searchTerm = req.query.searchTerm;
    knex.select('id', 'name')
    .from('folders')
    .modify( function(queryBuilder) {
        if(req.query.searchTerm){
            queryBuilder.where('name', 'like', `%${searchTerm}%`);
        }
    })
    .then(results => {
        res.json(results);
    })
    .catch(err => next(err));
});

//GET FOLDER BY ID

router.get('/:id', (req, res, next) => {
    const searchId = req.params.id;
    knex.select()
    .from('folders')
    .where('id', `${searchId}`)
    .then(results => {
        if(results.length !== 0){
        res.json(results[0]);
        } else {
            const err = new Error ('Item not found');
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
});

//UPDATE FOLDER (noteful app won't use it)

//Create a folder
router.post('/', (req, res, next) => {
    const { name } = req.body;
    const newItem = { name };
    knex
      .from('folders')
      .insert(newItem, ['name', 'id'])
      .then(result => {
          res.json(result[0]);
      })
      .catch(err => {
          next(err);
      })
});
//accepts object with a name
//inserts into the DB
//returns item along with new id

//Delete Folder by Id, accepts ID, deletes folder
//returns 204 status

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('folders')
    .where('id', `${id}`)
    .del()
    .then(result => {
        res.sendStatus(204);
        
    })
    .catch(err => {
        next(err);
    });
});






module.exports = router;