const express = require('express');
const router = express.Router();
const uuid = require('uuidv4').default;
const { executeQuery } = require('../lib/db');

/* Returns the information of a specific token entity. */
router.get('/:token', async (req, res) => {
  /* Tip! Queries tend to be long, so go to menu at top of vs code View > Toggle Word Wrap. */
  const token = req.params.token;
  const query = `SELECT organization, issued FROM tokens WHERE token='${token}';`;
  const results = await executeQuery(query);
  if (results.length == 0) {
    res.status(204);
    res.send(`Notice: Cannot locate token ${token} in our database.`);
  } else {
    res.status(200);
    res.send(results);
  }
});

/* Returns all tokens in our database. */
router.get('/', async (req, res) => {
  const query = `SELECT token FROM tokens ORDER BY issued DESC;`;
  const results = await executeQuery(query);
  if (results.length == 0) {
    res.status(204);
    res.send("Notice: No tokens exist.");
  } else {
    res.status(200);
    res.send(results);
  }
});

/*
Request: POST /api/tokens, body={“organization”: “My Company Name”}
Response: 500, 202: {“id”: 0, “token”: “...”, “issued”: “datetime”}
*/
router.post('/:organization', async (req, res) => {
  const organization = req.params.organization;
  /* Checks and handles if the organization making the post request already has an existing token/account with us. */
  const org_token = await check_organizational_existance(organization);
  if (org_token) {
    res.status(200)
    res.send(`Notice: Your organization, ${organization}, already has an account.`);
    return;
  }
  /* The user is new and thus we generate a new token for them. */
  const new_token = uuid();
  const query = `INSERT INTO tokens (token, organization, issued) VALUES ('${new_token}', '${organization}', CURRENT_TIMESTAMP());`;
  const results = await executeQuery(query);
  /* Returns the json of new record that was inserted into the table. */
  res.status(201)
  res.send({"token": {"id": results.insertId, "organization": organization, "token": new_token}});
});

/* This function is used to check if an organization exist within our Tokens table. */
async function check_organizational_existance(org_name){
  const query = `SELECT token FROM tokens WHERE organization='${org_name}';`;
  const results = await executeQuery(query);
  return !results || !results[0] ? undefined : results[0].token;
}

module.exports = router;
