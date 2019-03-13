module.exports = {
  opts: {
    destination: './docs/',
    recurse: true,
    access: 'all',
    private: true,
    readme: './docs/README.md',
    template: './node_modules/jsdoc-template',
  },
  source: {
    include: [
      'src/',
    ],
    exclude: [
      'node_modules/',
    ],
  },
  templates: {
    referenceTitle: 'SpikeyBot-Discord',
    collapse: true,
    resources: {
      'Discord': 'https://discord.gg/u6U2WRD',
      'Bot Website': 'https://www.spikeybot.com/',
      'GitHub': 'https://github.com/CampbellCrowley/SpikeyBot-Discord',
      'Discord.js': 'https://discord.js.org/#/docs/main/master/general/welcome',
    },
    default: {
      useLongnameInNav: true,
    },
  },
};
