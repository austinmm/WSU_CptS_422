const express = require('express');
const router = express.Router();
const db = require('../lib/db');

/* Checks that all 'api/tag' request are made with the Bearer Auth. */
router.use('/', async (req, res, next) => {
  if (res.locals.token == undefined) {
    res.status(401);
    res.send({code: 401, message: 'No authentication provided.'});
  } else if (res.locals.token_id == -1) {
    res.status(403);
    res.send({code: 403, message: 'Improper authentication provided.'});
  } else {
    next();
  }
});

/* User creates/updates a specific tag/interaction. */
router.post('/:name', async (req, res) => {
  const tag_name = req.params.name;
  const interaction = req.body.interaction;
  var value = req.body.value;
  if (!value){
    value = '';
  }
  const token_id = res.locals.token_id;

  var results = await db.executeQuery(`INSERT INTO tags (token_id, name, value, created) VALUES (${token_id}, '${tag_name}', '${value}', CURRENT_TIMESTAMP()) ON DUPLICATE KEY UPDATE value='${value}';`);
  var tag_id = results.insertId;
  /* Tag already exist so we need to obtain its 'id' to enter the new interaction. */
  if (tag_id == 0) {
    results = await db.executeQuery(`SELECT id FROM tags WHERE name='${tag_name}' AND token_id = ${token_id};`);
    tag_id = results[0].id;
    // Update the tag value.
    await db.executeQuery(`UPDATE tags SET value = '${value}' WHERE token_id = ${token_id};`);
  }

  await db.executeQuery(`INSERT INTO interactions (tag_id, action, time) VALUES ('${tag_id}', '${interaction}', CURRENT_TIMESTAMP());`);
  res.status(201);
  res.send({"tag": {"name": tag_name, "value": value}, "interaction": interaction});
});

/* User queries a specific tag. */
router.get('/:name', async (req, res) => {
  const tag_name = req.params.name;
  const token = res.locals.token;
  /* The following SQL statement selects all tags with a name starting with "tag_name". */
  var query = `SELECT name, value, created FROM tags, tokens WHERE token='${token}' AND tags.token_id = tokens.id AND tags.name LIKE '${tag_name}%';`;
  const results = await db.executeQuery(query);
  if (results.length == 0) {
    res.status(404);
    res.send({code: 404, message: 'You have not created any tags.'});
  } else {
    res.status(200);
    res.send(results);
  }
});

/* User queries all their tags. */
router.get('/', async (req, res) => {
  const token = res.locals.token;
  /* If the tag name is provided then we return the tag provided else we return all tags. */
  var query = `SELECT name, value, created FROM tags, tokens WHERE token='${token}' AND tags.token_id = tokens.id;`;
  const results = await db.executeQuery(query);
  /* Returns the json of new record that was inserted into the table. */
  if (results.length == 0) {
    res.status(404);
    res.send({code: 404, message: 'You have not created any tags.'});
  } else {
    res.status(200);
    res.send(results);
  }
});

module.exports = router;
