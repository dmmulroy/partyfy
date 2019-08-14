const path = require('path');
const fs = require('fs');

const Jimp = require('jimp');
const GifEncoder = require('gif-encoder');

const colors = [
  '#ff8d8b',
  '#fed689',
  '#88ff89',
  '#87ffff',
  '#8bb5fe',
  '#d78cff',
  '#ff8cff',
  '#ff68f7',
  '#fe6cb7',
  '#ff6968'
];

// const rgbColors = [
//   [255, 141, 139],
//   [254, 214, 137],
//   [136, 255, 137],
//   [135, 255, 255],
//   [139, 181, 254],
//   [215, 140, 255],
//   [255, 140, 255],
//   [255, 104, 247],
//   [254, 108, 183],
//   [255, 105, 104]
// ];

async function main() {
  try {
    const image = await Jimp.read(
      path.join(__dirname, 'input_images', 'input.png')
    );

    image.greyscale();

    const gifEncoder = new GifEncoder(image.bitmap.width, image.bitmap.height);

    gifEncoder.pipe(
      fs.createWriteStream(path.join(__dirname, 'output_images', 'output.png'))
    );
    gifEncoder.setDelay(100);

    gifEncoder.setRepeat(0); // loop forever

    gifEncoder.setTransparent('0x00FF00');

    gifEncoder.writeHeader();

    gifEncoder.on('readable', gifEncoder.read);

    colors.forEach(color => {
      const clonedImage = image.clone();

      clonedImage.color([{ apply: 'mix', params: [color] }]);

      gifEncoder.addFrame(clonedImage.bitmap.data);
      gifEncoder.flushData();
    });

    gifEncoder.finish();
  } catch (err) {
    console.error(err);
  }
}

main();