const partyfy = require('./index.js');

async function main() {
<<<<<<< HEAD
  const [, , inputFile, outputFile] = process.argv;
=======
  const [,, inputFile, outputFile]
>>>>>>> f01b35b0a8dbcbd2d5c029fc3dbae2b4a0cfff3c
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
