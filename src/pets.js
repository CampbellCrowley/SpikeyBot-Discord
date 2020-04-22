// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');

delete require.cache[require.resolve('./locale/Strings.js')];
const Strings = require('./locale/Strings.js');

delete require.cache[require.resolve('./pets/Constants.js')];
delete require.cache[require.resolve('./pets/Pet.js')];
delete require.cache[require.resolve('./pets/BasePets.js')];
delete require.cache[require.resolve('./pets/BaseMoves.js')];
delete require.cache[require.resolve('./pets/BasePetClasses.js')];
const Constants = require('./pets/Constants.js');
const Pet = require('./pets/Pet.js');
const BasePets = require('./pets/BasePets.js');
const BaseMoves = require('./pets/BaseMoves.js');
const BasePetClasses = require('./pets/BasePetClasses.js');

const confirm = '✅';
const cancel = '❌';

/**
 * @description Manages pet related commands.
 * @listens Command#pet
 * @augments SubModule
 */
class Pets extends SubModule {
  /**
   * @description SubModule managing pet related commands.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Pets';
    /** @inheritdoc */
    this.postPrefix = 'pet ';

    /**
     * @description All pets currently cached. Mapped by user ID, then pet ID.
     * Only one pet is allowed per user at this time, but this future proofing
     * in case users will be able to have multiples in the future.
     * @private
     * @type {object.<object.<Pet>>}
     * @default
     */
    this._pets = {};

    /**
     * @description Cache of IDs that are currently being released to disk, but
     * are not loaded anymore. Used for {@link Pets._releasePet} to prevent
     * saving multiple times. If the ID exists, it will be true.
     * @private
     * @type {object.<boolean>}
     * @default
     */
    this._releasing = {};

    /**
     * @description Instance of {@link Pets~BasePets}.
     * @private
     * @type {Pets~BasePets}
     * @default
     * @constant
     */
    this._basePets = new BasePets();
    /**
     * @description Instance of {@link Pets~BaseMoves}.
     * @private
     * @type {Pets~BaseMoves}
     * @default
     * @constant
     */
    this._baseMoves = new BaseMoves();

    /**
     * @description Instance of locale string manager.
     * @private
     * @type {Strings}
     * @default
     * @constant
     */
    this._strings = new Strings('pets');
    this._strings.purge();

    this._getAllPets = this._getAllPets.bind(this);
    this._getPet = this._getPet.bind(this);
    this._commandPet = this._commandPet.bind(this);
    this._commandAdopt = this._commandAdopt.bind(this);
    this._commandAbandon = this._commandAbandon.bind(this);
    this._releasePet = this._releasePet.bind(this);
    this._saveSingle = this._saveSingle.bind(this);
    this._checkPurge = this._checkPurge.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(['pet'], this._commandPet, null, [
          new this.command.SingleCommand(['adopt', 'new'], this._commandAdopt),
          new this.command.SingleCommand(['abandon'], this._commandAbandon),
        ]));

    this._basePets.initialize();
    this._baseMoves.initialize();

    /**
     * @description Release pet from memory.
     * @see {@link Pet._releasePet}
     */
    this.client.releasePet = this._releasePet;
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('pet');
    this.client.releasePet = null;
    this._basePets.shutdown();
    this._baseMoves.shutdown();
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    const list = Object.values(this._pets).reduce((a, c) => {
      return a = a.concat(Object.values(c));
    }, []);

    list.forEach((obj) => {
      this._saveSingle(obj, opt);
    });
  }
  /**
   * @description Reply to msg with locale strings.
   * @private
   *
   * @param {external:Discord~Message} msg Message to reply to.
   * @param {?string} titleKey String key for the title, or null for default.
   * @param {string} bodyKey String key for the body message.
   * @param {string} [rep] Placeholder replacements for the body only.
   * @returns {Promise<external:Discord~Message>} Message send promise from
   * {@link external:Discord}.
   */
  _reply(msg, titleKey, bodyKey, ...rep) {
    return this.common.reply(
        msg, this._strings.get(titleKey, msg.locale),
        this._strings.get(bodyKey, msg.locale, rep));
  }

  /**
   * @description Save a single pet object to disk, and purge if stale.
   * @private
   * @param {Pet} obj The pet object to save.
   * @param {string} [opt='sync'] Either 'sync' or 'async'.
   * @param {Function} [cb] Optional callback that fires with no arguments on
   * completion.
   */
  _saveSingle(obj, opt = 'sync', cb) {
    const dir = `${this.common.userSaveDir}${obj.owner}/pets/`;
    const filename = `${dir}${obj.id}.json`;
    if (opt == 'async') {
      this.common.mkAndWrite(
          filename, dir, JSON.stringify(obj.serializable), () => {
            this._checkPurge(obj);
            if (typeof cb === 'function') cb();
          });
    } else {
      this.common.mkAndWriteSync(
          filename, dir, JSON.stringify(obj.serializable));
      this._checkPurge(obj);
      if (typeof cb === 'function') cb();
    }
  }

  /**
   * @description Check if pet is purgable from memory, and purges if possible.
   * @private
   * @param {Pet} obj Pet object to potentially purge.
   */
  _checkPurge(obj) {
    if (Date.now() - obj._lastInteractTime > 5 * 60 * 1000) {
      delete this._pets[obj.owner][obj.id];
    }
  }

  /**
   * @description User typed the pet command.
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pet
   */
  _commandPet(msg) {
    this._getAllPets(msg.author, (err, pets) => {
      if (err) {
        this.common.reply(msg, err);
        return;
      }
      if (pets.length == 0) {
        this._reply(msg, 'title', 'noPet', `${msg.prefix}${this.postPrefix}`);
      } else {
        // Temporary.
        this.common.reply(
            msg, 'Pets',
            JSON.stringify(pets.map((el) => el.serializable), null, 2));
      }
    });
  }

  /**
   * @description User requested to adopt a new pet.
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pet_adopt
   */
  _commandAdopt(msg) {
    this._getAllPets(msg.author, (err, pets) => {
      if (err) {
        this.common.reply(msg, err);
        return;
      }
      if (pets.length == 0) {
        const match = msg.text.match(/^\s*(\w+)\s+(\w{1,16})$/);
        const species = match && this._basePets.get(match[1]);
        if (!match) {
          this._reply(msg, 'noSpecies', 'availableSpeciesInfo');
          return;
        } else if (!species) {
          this._reply(msg, 'invalidSpecies', 'availableSpeciesInfo');
          return;
        } else if (!match[2] || match[2].length < 3) {
          this._reply(msg, 'invalidName', 'nameInstructions', 3, 16);
          return;
        }
        let reactMessage;
        this._reply(
            msg, 'title', 'confirmAdopt', match[1], match[2], confirm,
            cancel)
            .then((m) => {
              reactMessage = m;
              return m.react(confirm).then(() => m.react(cancel));
            })
            .then(() => {
              return reactMessage.awaitReactions((reaction, user) => {
                return user.id == msg.author.id &&
                    (reaction.emoji.name == confirm ||
                     reaction.emoji.name == cancel);
              }, {max: 1, time: 30000});
            })
            .then((reactions) => {
              reactMessage.reactions.removeAll().catch(() => {});
              if (reactions.size == 0) {
                reactMessage.edit(
                    this._strings.get('commandTimedOut', msg.locale));
                return;
              } else if (reactions.first().emoji.name == cancel) {
                reactMessage.edit(this._strings.get('cancelled', msg.locale));
                return;
              }
              reactMessage.edit(this._strings.get('confirmed', msg.locale));
              const newPet = new Pet(msg.author.id, match[2], match[1]);
              this._saveSingle(newPet, 'async', () => {
                this._reply(
                    msg, 'title', 'adoptionConfirmed', species.name, match[2]);
              });
            });
      } else {
        this._reply(msg, 'title', 'alreadyHavePet');
      }
    });
  }

  /**
   * @description User requested to abandon a pet.
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pet_abandon
   */
  _commandAbandon(msg) {
    this._getAllPets(msg.author, (err, pets) => {
      if (err) {
        this.common.reply(msg, err);
        return;
      }
      if (pets.length == 0) {
        this.common.reply(
            msg, 'Pets',
            'You don\'t have a pet that you can abandon.\nYou can adopt a new' +
                ' one with `' + msg.prefix + this.postPrefix + 'adopt`');
        return;
      }
      let reactMessage;
      this.common
          .reply(
              msg, 'Are you sure?',
              'This cannot be undone, your pet will never forgive you if you ' +
                  'abandon them.\n' + confirm + ': yes, ' + cancel + ': no')
          .then((m) => {
            reactMessage = m;
            m.react(confirm).then(() => m.react(cancel));
          })
          .then(() => {
            return reactMessage.awaitReactions((reaction, user) => {
              return user.id == msg.author.id &&
                  (reaction.emoji.name == confirm ||
                   reaction.emoji.name == cancel);
            }, {max: 1, time: 30000});
          })
          .then((reactions) => {
            reactMessage.reactions.removeAll().catch(() => {});
            if (reactions.size == 0) {
              reactMessage.edit('Timed out, enter command again.');
              return;
            } else if (reactions.first().emoji.name == cancel) {
              reactMessage.edit('Cancelled');
              return;
            }
            reactMessage.edit('Confirmed');
            const uId = msg.author.id;
            const pId = pets[0].id;

            const fName = `${this.common.userSaveDir}${uId}/pets/${pId}.json`;
            fs.open(`${fName}.DELETEME`, 'w', 0o664, (err, fd) => {
              if (err) {
                this.error(
                    'Failed to mark pet file for deletion: ' +
                    `${fName}.DELETEME`);
                console.error(err);
              }
              if (fd) fs.close(fd, (err) => err && console.error(err));
            });
            fs.unlink(fName, (err) => {
              if (err) {
                this.error('Failed to delete pet file: ' + fName);
                console.error(err);
                return;
              }
              const pet = this._pets[uId][pId];
              this.common.reply(
                  msg, 'Pet Abandoned', `${pet.name} (${pet.species})`);
              delete this._pets[uId][pId];
            });
          });
    });
  }

  /**
   * @description Get an array of all of a user's pets.
   * @private
   * @param {external:Discord~User} user Discord user to fetch all pets for.
   * @param {Function} cb Callback with first argument as optional error, and
   * second as array of Pet objects.
   */
  _getAllPets(user, cb) {
    const dir = `${this.common.userSaveDir}${user.id}/pets/`;

    fs.readdir(dir, (err, files) => {
      if (err) {
        if (err.code === 'ENOENT') {
          cb(null, []);
          return;
        }
        cb(err);
        return;
      }
      let numDone = 0;
      let numTotal = 0;
      const list = [];
      const done = function(err, pet) {
        numDone++;
        if (!err) list.push(pet);
        if (numDone >= numTotal) {
          cb(null, list);
        }
      };
      for (const file of files) {
        const filename = file.match(/^(.*)\.json$/);
        if (!filename) continue;
        numTotal++;
        this._getPet(user, filename[1], done);
      }
      if (numTotal === 0) {
        cb(null, []);
      }
    });
  }

  /**
   * @description Fetch a user's pet.
   * @private
   * @param {external:Discord~User} user A user of which to fetch the pet for.
   * @param {string} pId The pet ID to fetch.
   * @param {Function} cb Callback once complete. First argument is optional
   * error, second is parsed Pet object.
   */
  _getPet(user, pId, cb) {
    const uId = user.id;
    const obj = this._pets[uId] && this._pets[uId][pId];
    if (obj) {
      obj.touch();
      cb(null, obj);
      return;
    }

    const fname = `${this.common.userSaveDir}${uId}/pets/${pId}.json`;

    const self = this;

    const read = function() {
      fs.readFile(fname, (err, data) => {
        if (err) {
          cb(err);
          return;
        }
        let parsed;
        try {
          parsed = Pet.from(JSON.parse(data));
        } catch (err) {
          cb(err);
          return;
        }
        if (!self._pets[uId]) self._pets[uId] = {};
        self._pets[uId][pId] = parsed;
        cb(null, parsed);
      });
    };

    if (this.client.shard) {
      const toSend = `this.releasePet('${uId}', '${pId}')`;
      const release = function() {
        self.client.shard.broadcastEval(toSend)
            .then((res) => {
              const wait = res.find((el) => !el);
              if (wait) {
                self.client.setTimeout(release, 100);
              } else {
                read();
              }
            })
            .catch((err) => {
              self.error(
                  'Failed to release pet from other shards: ' + uId + ' ' +
                  pId);
              console.error(err);
              cb('Failed to release pet from other shards.');
            });
      };
      release();
    } else {
      read();
    }
  }

  /**
   * @description Force a pet to be saved to file and removed from memory
   * immediately. File IO is still asynchronous. This is used to release pets
   * from other shards, and returns true if pet has been completely released to
   * disk.
   * @private
   * @param {string} uId The ID of the user.
   * @param {string} pId THe ID of the pet.
   * @returns {boolean} True if fully released, false if not done yet.
   */
  _releasePet(uId, pId) {
    const releaseId = `${uId}_${pId}`;
    if (!this._pets[uId] || !this._pets[uId][pId]) {
      return !this._releasing[releaseId];
    }

    this._releasing[releaseId] = true;

    this._saveSingle(this._pets[uId][pId], 'async', () => {
      delete this._releasing[releaseId];
    });

    delete this._pets[uId][pId];

    return false;
  }
}

Pets.Pet = Pet;
Pets.BasePets = BasePets;
Pets.BaseMoves = BaseMoves;
Pets.BasePetClasses = BasePetClasses;
Pets.Constants = Constants;
Pets.Strings = Strings;

module.exports = new Pets();
