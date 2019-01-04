'use strict';

const knex = require('../knex');

const newObject = {title: 'How I died', content: 'Too many chickens'};

knex
  .insert(newObject)
  .into('notes')
  .returning(['id', 'title', 'content'])
  .then(result =>{
    console.log(result);
  })

// knex
//   .from('notes')
//   .insert([{title: 'The Title', content: 'The Content'}, {title: 'Another Title', content: 'More Content'}])
//   .returning('*')
//   .then(results => {
//     console.log(results);
//   });

// knex
//   .select()
//   .from('notes')
//   .then(results =>{
//     console.log(results);
//   })

let searchTerm = 'More';
knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });

  
  const searchId = 4;
  knex
    .select()
    .from('notes')
    .where('id', `${searchId}`)
    .then(results => {
      console.log(results[0]);
    })

  const testObject1 = {title: 'Bilbo Baggins', content: 'Three feet tall'};
  const testObject2 = {title: 'Hello Kitty'};
  const searchId1 = 3;
  knex
    .from('notes')
    .where('id', `${searchId1}`)
    .update(testObject2, ['id', 'title', 'content'])
    .then(results => {
      console.log(results)
    })
  
  const deleteId = 1;

  knex
    .from('notes')
    .where('id', `${deleteId}`)
    .del()
    .then(result => {
      console.log(result)
    });