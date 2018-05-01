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
      fs.writeFile(
          filename.replace(/\.json$/, '.md'), objToMd(JSON.parse(file)),
          function(err) {
            if (err) {
              console.log(
                  'Failed to write file', filename.replace(/\.json$/, '.md'),
                  err);
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
      text += '## ' + repTags(sec.title) + '\n';
    }
    text += 'Command | Description\n';
    text += '--- | ---\n';
    for (let r in sec.rows) {
      let row = repTags(sec.rows[r]).split('//');
      text += prefix + row[0] + ' | ' + row[1] + '\n';
    }
  }
  return text;
}

function repTags(text) {
  return text.replace(regex, function(match) {
    return tags[match];
  });
}
