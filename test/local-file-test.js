const path = require('path');
const fs = require('fs');

const partyfy = require('../src/partyfy');

async function main() {
  const [, , inputFile, outputFile] = process.argv;
  try {
    const imageFile = fs.readFileSync(path.resolve(inputFile));

    const partyImage = await partyfy(imageFile, { overlayOpacity: 100 });

    fs.writeFileSync(path.resolve(outputFile), partyImage);
  } catch (err) {
    console.log(err);
  }
}

main();
