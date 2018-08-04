const exec = require('child_process').exec;

exec('npm start', function(err, stdout, stderr) {
  console.log('stdout: ', stdout);
  console.error('stderr: ', stderr);
  if (err) console.log('exec error: ', err);
});
