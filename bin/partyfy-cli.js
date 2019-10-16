#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const program = require('commander');

const partyfy = require('../dist/partyfy.cjs');
const pkg = require('../package.json');

const main = () => {
  try {
    program
      .version(pkg.version)
      .name('partyfy')
      .description('A CLI for partyfy.')
      .usage('<source> <dest> [options]')
      .arguments('<sourceFile> <destFile>')
      .action(async (source, dest) => {
        try {
          const imageFile = fs.readFileSync(path.resolve(source));

          const partyImage = await partyfy(imageFile, {
            frameDelay: program.delay,
            overlayOpacity: clamp(program.opacity, 100, 0)
          });

          fs.writeFileSync(path.resolve(dest), partyImage);
          console.log(`${dest} succesfully created!`);
        } catch (err) {
          console.log(err);
        }
      })
      .option(
        '-d, --delay <ms>',
        'The Speed in milliseconds between frames.',
        75
      )
      .option(
        '-o, --opacity <value>',
        'Opacity of the overlayed party color (0 - 100).',
        60
      )
      .parse(process.argv);
  } catch (err) {
    console.log(err);
  }
};

main();

function clamp(value, max, min) {
  return Math.max(min, Math.min(value, max));
}
