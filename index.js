const path = require('path');
const fs = require('fs');

const Jimp = require('jimp');
const { GifCodec, GifFrame, GifUtil } = require('gifwrap');

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

function mix(color, overlayedColor, opacity = 55) {
  return {
    r: (overlayedColor.r - color.r) * (opacity / 100) + color.r,
    g: (overlayedColor.g - color.g) * (opacity / 100) + color.g,
    b: (overlayedColor.b - color.b) * (opacity / 100) + color.b
  };
}

const codec = new GifCodec();

async function partyfy(imageBuffer, options = {}) {
  try {
    const image = await Jimp.read(imageBuffer);

    image.greyscale();

    if (image.getMIME() === Jimp.MIME_GIF) {
      GifUtil.read(imageBuffer).then(gif => console.log(gif.frames.length));
    } else {
      const frames = [];

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
              clonedImage.setPixelColor(0x00, x, y);
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

        frames.push(new GifFrame(clonedImage.bitmap, { delayCentisecs: 7.5 }));
      });

      const { buffer } = await codec.encodeGif(frames, {
        useTransparency: true
      });
      return buffer;
    }
  } catch (err) {
    console.error(err);

    throw new Error('partyfy error: ', err);
  }
}

async function main() {
  try {
    const imageFile = fs.readFileSync(
      path.join(__dirname, 'input_images', 'docker.png')
    );

    const partyImage = await partyfy(imageFile);

    fs.writeFileSync(
      path.join(__dirname, 'output_images', 'docker.png'),
      partyImage
    );
  } catch (err) {
    console.log(err);
  }
}

main();
