// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/* eslint-disable require-jsdoc, guard-for-in */
let fs = require('fs');

const tags = {
  '{hgRole}': 'HG Creator',
  '{prefix}': '?',
};
const keys = Object.keys(tags).map(function(el) {
  return el.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
});
const regex = new RegExp(keys.join('|'), 'g');

for (let i in process.argv) {
  if (i < 2) continue;
  convertFile(process.argv[i]);
}

function convertFile(filename) {
  fs.readFile(filename, function(err, file) {
    if (err) {
      console.log('Failed to read file', filename, err);
      return;
    }
    try {
      fs.writeFile(filename + '.md', objToMd(JSON.parse(file)), function(err) {
        if (err) {
          console.log('Failed to write file', filename + '.md', err);
          return;
        }
      });
    } catch (e) {
      console.log('Failed to convert to md', filename, e);
      return;
    }
  });
}

function objToMd(file) {
  let text = '';
  let prefix = '?' + (file.prefix || '');
  if (file.title) {
    text += '# ' + repTags(file.title) + '\n';
  }
  if (file.description) {
    text += '#### ' + repTags(file.description) + '\n';
  }
  text += '***\n';
  for (let i in file.sections) {
    let sec = file.sections[i];
    if (sec.title) {
      text = '## ' + repTags(sec.title) + '\n' + text;
    }

    const hasAliases = sec.rows.find(function(row) {
      return row.aliases;
    });

    text +=
        '\n| Command | Description |' + (hasAliases ? ' Aliases |\n' : '\n');
    text += '| --- | --- |' + (hasAliases ? ' --- |\n' : '\n');

    for (let r in sec.rows) {
      let row = ['', '', ''];
      if (typeof sec.rows[r] === 'string') {
        row = repTags(sec.rows[r]).split('//');
      } else if (typeof sec.rows[r] === 'object') {
        row[0] = repTags(sec.rows[r].command);
        row[1] = repTags(sec.rows[r].description);
        if (hasAliases) {
          row[2] = sec.rows[r].aliases || '';
        }
      }
      text += '| ' + prefix + row[0] + ' | ' + row[1] + ' |' +
          (hasAliases ? ' ' + row[2] + ' |\n' : '\n');
    }
    text += '\n';
  }
  return text;
}

function repTags(text) {
  return text.replace(regex, function(match) {
    return tags[match];
  });
}
