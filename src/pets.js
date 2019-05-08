// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
delete require.cache[require.resolve('./Pet.js')];
const Pet = require('./Pet.js');
const SubModule = require('./subModule.js');

/**
 * @description Manages pet related commands.
 * @listens Command#pet
 */
class Pets extends SubModule {
  /**
   * @description SubModule managing pet related commands.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Pets';

    /**
     * @description All pets currently cached. Mapped by guild ID, then user ID,
     * then pet ID. Only one pet is allowed per user at this time, but this
     * future proofing in case users will be able to have multiples in the
     * future.
     * @private
     * @type {Object.<Object.<Object.<Pet>>>}
     * @default
     */
    this._pets = {};

    this.Pet = Pet;

    this._getAllPets = this._getAllPets.bind(this);
    this._getPet = this._getPet.bind(this);
    this._commandPet = this._commandPet.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(
            ['pet'], this._commandPet, {validOnlyInGuild: true}));
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('pet');
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    Object.values(this._pets).forEach((obj) => {
      const dir = `${this.common.guildSaveDir}${obj.guild}/pets/${obj.owner}/`;
      const filename = `${dir}${obj.id}.json`;
      if (opt == 'async') {
        this.common.mkAndWrite(filename, dir, JSON.stringify(obj.serializable));
      } else {
        this.common.mkAndWriteSync(
            filename, dir, JSON.stringify(obj.serializable));
      }
    });
  }

  /**
   * @description User typed the pet command.
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pet
   */
  _commandPet(msg) {
    this._getAllPetsPet(msg.member, (err, pets) => {

    });
  }

  /**
   * @description Get an array of all of a user's pets in a guild.
   * @private
   * @param {external:Discord~GuildMember} member Guild member to fetch all pets
   * for.
   * @param {Function} cb Callback with first argument as optional error, and
   * second as array of Pet objects.
   */
  _getAllPets(member, cb) {
    const gId = member.guild.id;
    const uId = member.user.id;
    const dir = `${this.common.guildSaveDir}${gId}/pets/${uId}/`;

    fs.readdir(dir, (err, files) => {
      if (err) {
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
        this._getPet(member, filename[1], done);
      }
      if (numTotal === 0) {
        cb(null, []);
      }
    });
  }

  /**
   * @description Fetch a user's pet.
   * @private
   * @param {external:Discord~GuildMember} member A guild member of which
   * to fetch the pet for.
   * @param {string} pId The pet ID to fetch.
   * @param {Function} cb Callback once complete. First argument is optional
   * error, second is parsed Pet object.
   */
  _getPet(member, pId, cb) {
    const gId = member.guild.id;
    const uId = member.user.id;

    const obj =
        this._pets[gId] && this._pets[gId][uId] && this._pets[gId][uId][pId];
    if (obj) {
      obj.touch();
      cb(null, obj);
      return;
    }

    const fname = `${this.common.guildSaveDir}${gId}/pets/${uId}/${pId}.json`;

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
      if (!this._pets[gId]) this._pets[gId] = {};
      if (!this._pets[gId][uId]) this._pets[gId][uId] = {};
      this._pets[gId][uId][pId] = parsed;
      cb(null, parsed);
    });
  }
}

Pets.Pet = Pet;

module.exports = new Pets();
