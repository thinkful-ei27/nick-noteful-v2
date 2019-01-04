'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId;
  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const searchId = req.params.id;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as foldersId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', `${searchId}`)
    .then(results => {
      if(results.length !== 0){
      // console.log(results);
      // console.log(results.length);
      // console.log(results.length === 0);
      res.json(results[0]);
      } else {
        // console.log(results);
        // console.log(results.length);
        // console.log(results.length === 0);;
        const err = new Error('Item not found');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  knex
    .from('notes')
    .where('id', id)
    .update(updateObj, 'id')
    .then(([id]) => {
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id)
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
  });


    
  

  // updateableFields.forEach(field => {
  //   if (field in req.body) {
  //     updateObj[field] = req.body[field];
  //   }
  // });

  // /***** Never trust users - validate input *****/
  // if (!updateObj.title) {
  //   const err = new Error('Missing `title` in request body');
  //   err.status = 400;
  //   return next(err);
  // }

  // notes.update(id, updateObj)
  //   .then(item => {
  //     if (item) {
  //       res.json(item);
  //     } else {
  //       next();
  //     }
  //   })
  //   .catch(err => {
  //     next(err);
  //   });


// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;
  const newItem = { 
    title: title,
    content:content,
    folder_id: folderId 
  };
  
  // if (!newItem.title) { const err = new Error('Missing title in request body'); err.status = 400; return next(err); }

  let noteId;
  
  knex.insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
      .then(([result]) => {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      })
      .catch(err => next(err));
    });


  /***** Never trust users - validate input *****/
  // if (!newItem.title) {
  //   const err = new Error('Missing `title` in request body');
  //   err.status = 400;
  //   return next(err);
  // }

  // notes.create(newItem)
  //   .then(item => {
  //     if (item) {
  //       res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
  //     }
  //   })
  //   .catch(err => {
  //     next(err);
  //   });

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex
    .from('notes')
    .where('id', id)
    .del()
    .then(result => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });

  // notes.delete(id)
  //   .then(() => {
  //     res.sendStatus(204);
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

module.exports = router;
