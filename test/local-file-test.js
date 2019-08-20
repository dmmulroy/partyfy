const path = require('path');
const fs = require('fs');

const partyfy = require('../src/partyfy');

async function main() {
  const [, , inputFile, outputFile] = process.argv;
  try {
    const imageFile = fs.readFileSync(
      path.join(__dirname, 'input_images', inputFile)
    );

    const partyImage = await partyfy(imageFile);

    fs.writeFileSync(
      path.join(__dirname, 'output_images', outputFile),
      partyImage
    );
  } catch (err) {
    console.log(err);
  }
}

main();
