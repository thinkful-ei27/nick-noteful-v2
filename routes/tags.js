const express = require('express');
const knex = require('../knex');

const router = express.Router();

router.post('/', (req, res, next) => {
    const { name } = req.body;
  
    /***** Never trust users. Validate input *****/
    if (!name) {
      const err = new Error('Missing `name` in request body');
      err.status = 400;
      return next(err);
    }
  
    const newItem = { name };
  
    knex.insert(newItem)
      .into('tags')
      .returning(['id', 'name'])
      .then((results) => {
        // Uses Array index solution to get first item in results array
        const result = results[0];
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      })
      .catch(err => next(err));
  });

router.get('/', (req, res, next) => {
  knex
    .select()
    .from('tags')
    .then((results) => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex
    .select()
    .from('tags')
    .where('id', id)
    .then((results) => {
      if(results.length !== 0){
      res.json(results[0]);
      } else {
        const err = new Error(`Tag number ${id} does not exist`);
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) =>{
  const { name } = req.body;
  const newItem = { name };
  const id = req.params.id;
  // if(!newItem.name){
  //   const err = new Error('Missing name');
  //   err.status = 400;
  //   next(err);
  // }
  knex
    .from('tags')
    .where('id', id)
    .update(newItem, ['id', 'name'])
    .then((results) => {
        res.json(results[0]);
    })
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  knex
    .from('tags')
    .where('id', id)
    .del()
    .then((results) => {
      res.sendStatus(204);
    })
    .catch(err => next(err))
});



module.exports = router;