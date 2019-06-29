module.exports = {
  opts: {
    destination: './docs/',
    encoding: 'utf8',
    recurse: true,
    access: 'all',
    private: true,
    readme: './docs/README.md',
    template: './node_modules/ink-docstrap/template',
  },
  source: {
    include: [
      'src/',
    ],
    exclude: [
      'node_modules/',
      'dist/',
    ],
  },
  templates: {
    systemName: 'SpikeyBot-Discord',
    copyright: '<small>Website Contact: <a href="mailto:web@spikeybot.com">' +
        'web@spikeybot.com</a>.</small><br><small>&copy; Copyright 2019, ' +
        'Campbell Crowley. <a href="https://docs.google.com/document/d/' +
        '1SAC2aPxxeNqRjlZzjwrnCyyWWyt09ZP-AP7BDBjjQDg/edit?usp=sharing">' +
        'Privacy Policy</a></small>',
    navType: 'inline',
    theme: 'slate',
    linenums: true,
    analytics: {ua: 'UA-89923351-1', domain: 'www.spikeybot.com'},
    outputSourceFiles: true,
    dateFormat: 'LLLL (Z)',
    syntaxTheme: 'dark',
  },
};
