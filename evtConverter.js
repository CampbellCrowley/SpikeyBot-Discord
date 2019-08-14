// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
//
// This script is used to convert the hunger games events from the old
// single-JSON-file format to an ID based filesystem.
const fs = require('fs');
const mkdirp = require('mkdirp');
const sql = require('mysql');
const auth = require('./auth.js');
const crypto = require('crypto');

const oldFile = './save/hgEvents.json';
const oldWepFile = './save/hgWeapons.json';
const idListFile = './save/hgDefaultEvents.json';
const newDir = './save/hg/events/';
const ownerId = '124733888177111041';

const old = JSON.parse(fs.readFileSync(oldFile));
const oldWep = JSON.parse(fs.readFileSync(oldWepFile));

mkdirp.sync(newDir);

/**
 * The object describing the connection with the SQL server.
 *
 * @private
 * @type {sql.ConnectionConfig}
 */
let sqlCon;
/**
 * Create initial connection with sql server.
 *
 * @private
 */
function connectSQL() {
  /* eslint-disable-next-line new-cap */
  sqlCon = new sql.createConnection({
    user: auth.sqlUsername,
    password: auth.sqlPassword,
    host: auth.sqlHost,
    database: 'appusers',
    port: 3306,
  });
  sqlCon.on('error', function(e) {
    throw e;
  });
}
connectSQL();

const oldEnt = Object.entries(old);
const oldWepEnt = Object.entries(oldWep);

const newIds = {
  weapon: [],
};
const randList = {};

/**
 * @description Get a random ID.
 * @private
 * @returns {string} Generated ID.
 */
function getRand() {
  let rand;
  do {
    rand = crypto.randomBytes(4).readUInt32BE().toString(36);
  } while (randList[rand]);
  randList[rand] = true;
  return rand;
}

let numDone = 0;
let numTotal = 0;
// Convert weapon events.
oldWepEnt.forEach((el) => {
  if (el[0] === 'message') return;
  const now = Date.now();
  const id = `${ownerId}/${now}-${getRand()}`;
  newIds.weapon.push(id);

  const evt = el[1];
  evt.name = el[0];
  evt.id = id;
  evt.type = 'weapon';
  evt.creator = ownerId;
  evt.privacy = 'public';

  evt.outcomes.forEach((el) => {
    if (!el.id) el.id = getRand();
  });
});

oldWepEnt.forEach((el) => {
  if (el[0] === 'message') return;
  numTotal++;
  const evt = el[1];
  const id = evt.id;
  const now = id.match(/.*\/([^-]+)-/)[1];

  evt.outcomes.forEach((evt) => {
    if (evt.victim && evt.victim.weapon) {
      const w = evt.victim.weapon;
      evt.victim.weapon = {count: w.count, id: oldWep[w.name].id};
    }
    if (evt.attacker && evt.attacker.weapon) {
      const w = evt.attacker.weapon;
      evt.attacker.weapon = {count: w.count, id: oldWep[w.name].id};
    }
  });

  mkdirp(newDir + ownerId, (err) => {
    if (err) throw err;
    const toSend = sqlCon.format(
        'INSERT INTO HGEvents (Id, CreatorId, DateCreated, Privacy, ' +
            'EventType) VALUES (?, ?, FROM_UNIXTIME(?), "public", "weapon")',
        [id, ownerId, now / 1000]);
    fs.writeFile(`${newDir}${id}.json`, JSON.stringify(evt), (err) => {
      if (err) throw err;
      sqlCon.query(toSend, (err) => {
        if (err) {
          console.error('SQL QUERY FAILED:', toSend);
          throw err;
        }
        done();
      });
    });
  });
});
// Convert bloodbath, player, and arena events.
oldEnt.forEach((el) => {
  numTotal += el[1].length;
  const type = el[0] == 'arena' ? 'arena' : 'normal';
  newIds[el[0]] = [];

  mkdirp(newDir + ownerId, (err) => {
    if (err) throw err;
    el[1].forEach((evt) => {
      const rand = getRand();

      const now = Date.now();
      const id = `${ownerId}/${now}-${rand}`;
      newIds[el[0]].push(id);

      evt.id = id;
      evt.type = type;
      evt.creator = ownerId;
      evt.privacy = 'public';

      if (evt.victim && evt.victim.weapon) {
        const w = evt.victim.weapon;
        evt.victim.weapon = {count: w.count, id: oldWep[w.name].id};
      }
      if (evt.attacker && evt.attacker.weapon) {
        const w = evt.attacker.weapon;
        evt.attacker.weapon = {count: w.count, id: oldWep[w.name].id};
      }
      if (evt.outcomes) {
        evt.outcomes.forEach((el) => {
          if (!el.id) el.id = getRand();
        });
      }

      const toSend = sqlCon.format(
          'INSERT INTO HGEvents (Id, CreatorId, DateCreated, Privacy, ' +
              'EventType) VALUES (?, ?, FROM_UNIXTIME(?), "public", ?)',
          [id, ownerId, now / 1000, type]);
      fs.writeFile(newDir + id + '.json', JSON.stringify(evt), (err) => {
        if (err) {
          throw err;
        }
        sqlCon.query(toSend, (err) => {
          if (err) {
            console.error('SQL QUERY FAILED:', toSend);
            throw err;
          }
          done();
        });
      });
    });
  });
});

/**
 * Callback for each completed event request.
 */
function done() {
  numDone++;
  if (numDone < numTotal) return;
  process.stdout.write('\n');
  fs.writeFile(idListFile, JSON.stringify(newIds, null, 2), (err) => {
    if (err) {
      throw err;
    } else {
      console.log('Default event IDs written to', idListFile);
      sqlCon.end((err) => {
        if (err) console.error(err);
        console.log('Done');
      });
    }
  });
}
