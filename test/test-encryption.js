const expect = require('chai').expect;
const fs = require('fs');
const common = require('../src/common');

describe('Encryption', () => {
  it('Writing and reading a file', (done) => {
    const content = 'Hello World';
    const dir = './test/';
    const fn = 'test.txt';
    common.mkAndWrite(fn, dir, content, (err) => {
      if (err) {
        console.error(err);
        done(err);
        return;
      }
      expect(fs.existsSync(`${dir}${fn}.crypt`)).to.be.true;

      common.readFile(`${dir}${fn}`, (err, data) => {
        if (err) {
          console.error(err);
          done(err);
          return;
        }
        expect(data).to.eql(content);
        done();
      });
    });
  });
  it('Legacy naming', (done) => {
    const content = 'Hello World';
    const dir = './test/';
    const fn = `${dir}test.txt`;
    common.mkAndWrite(fn, dir, content, (err) => {
      if (err) {
        console.error(err);
        done(err);
        return;
      }
      expect(fs.existsSync(`${fn}.crypt`)).to.be.true;

      common.readFile(fn, (err, data) => {
        if (err) {
          console.error(err);
          done(err);
          return;
        }
        expect(data).to.eql(content);
        done();
      });
    });
  });
});

after(() => {
  const paths = [
    './test/test.txt',
    './test/test.txt.tmp',
    './test/test.txt.crypt',
  ];
  for (const p of paths) {
    try {
      fs.unlinkSync(p);
    } catch (e) {
      // Ignore.
    }
  }
});
