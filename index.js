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

const rgbColors = [
  [255, 141, 139],
  [254, 214, 137],
  [136, 255, 137],
  [135, 255, 255],
  [139, 181, 254],
  [215, 140, 255],
  [255, 140, 255],
  [255, 104, 247],
  [254, 108, 183],
  [255, 105, 104]
];

function mix(color, overlayedColor, opacity = 50) {
  return {
    r: (overlayedColor.r - color.r) * (opacity / 100) + color.r,
    g: (overlayedColor.g - color.g) * (opacity / 100) + color.g,
    b: (overlayedColor.b - color.b) * (opacity / 100) + color.b
  };
}

async function partyfy(inputBuffer, outputStream, options = {}) {
  try {
    const image = await Jimp.read(inputStream);

    image.greyscale();

    const gifEncoder = new GifEncoder(image.bitmap.width, image.bitmap.height);

    gifEncoder.pipe(outputStream);

    gifEncoder.setDelay(75);

    gifEncoder.setRepeat(0); // loop forever

    gifEncoder.setTransparent('0x00FF00');

    gifEncoder.writeHeader();

    gifEncoder.on('readable', gifEncoder.read);

    colors.forEach(color => {
      const clonedImage = image.clone();

      clonedImage.scan(
        0,
        0,
        clonedImage.bitmap.width,
        clonedImage.bitmap.height,
        (x, y, idx) => {
          const transparent = clonedImage.bitmap.data[idx + 3] < 1;

          if (transparent) {
            clonedImage.setPixelColor(Jimp.rgbaToInt(0, 255, 0, 0), x, y);
          } else {
            const currentColor = Jimp.intToRGBA(
              clonedImage.getPixelColor(x, y)
            );

            const partyColor = Jimp.intToRGBA(Jimp.cssColorToHex(color));

            const { r, g, b, a = 1 } = mix(currentColor, partyColor);

            clonedImage.setPixelColor(Jimp.rgbaToInt(r, g, b, a), x, y);
          }
        }
      );

      gifEncoder.addFrame(clonedImage.bitmap.data);
      gifEncoder.flushData();
    });

    gifEncoder.finish();
  } catch (err) {
    console.error(err);

    throw new Error('partyfy error: ', err);
  }
}

async function main() {
  try {
    const imageFile = fs.readFileSync(
      path.join(__dirname, 'input_images', 'input.png')
    );

    console.log(imageFile);

    const ouptputFile = fs.createWriteStream(
      path.join(__dirname, 'output_images', 'output.png')
    );

    await partyfy(imageFile, ouptputFile);
  } catch (err) {
    console.log(err);
  }
}

main();
