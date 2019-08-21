#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const partyfy = require('../dist/partyfy.cjs');

(async () => {
  const [, , inputFile, outputFile] = process.argv;
  try {
    const imageFile = fs.readFileSync(path.resolve(inputFile));

    const partyImage = await partyfy(imageFile);

    fs.writeFileSync(path.resolve(outputFile), partyImage);
    console.log(`${outputFile} succesfully created!`);
  } catch (err) {
    console.log(err);
  }
})();
