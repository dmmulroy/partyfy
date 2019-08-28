const Jimp = require('jimp');
const { GifCodec, GifFrame, GifUtil } = require('gifwrap');

const codec = new GifCodec();

const TRANSPARENT_HEX = 0x00;

const colors = [
  { r: 255, g: 141, b: 139, a: 1 },
  { r: 254, g: 214, b: 137, a: 1 },
  { r: 136, g: 255, b: 137, a: 1 },
  { r: 135, g: 255, b: 255, a: 1 },
  { r: 139, g: 181, b: 254, a: 1 },
  { r: 215, g: 140, b: 255, a: 1 },
  { r: 255, g: 140, b: 255, a: 1 },
  { r: 255, g: 104, b: 247, a: 1 },
  { r: 254, g: 108, b: 183, a: 1 },
  { r: 255, g: 105, b: 104, a: 1 }
];

const defaultOptions = {
  overlayOpacity: 60,
  frameDelay: 75
};

async function partyfy(imageBuffer, options = defaultOptions) {
  try {
    const image = await Jimp.read(imageBuffer);
    const frames = [];
    const opts = { ...defaultOptions, ...options };

    if (image.getMIME() === Jimp.MIME_GIF) {
      const gif = await GifUtil.read(imageBuffer);

      if (gif.frames.length > 1)
        throw new Error('animated gifs are not currently supported');
    }

    console.log([...image.bitmap.data]);

    // image.greyscale();

    colors.forEach(partyColor => {
      const clonedImage = image.clone();

      clonedImage.scan(
        0,
        0,
        clonedImage.bitmap.width,
        clonedImage.bitmap.height,
        (x, y, idx) => {
          const isTransparent = clonedImage.bitmap.data[idx + 3] < 1;

          if (isTransparent) {
            clonedImage.setPixelColor(TRANSPARENT_HEX, x, y);
          } else {
            const currentColor = Jimp.intToRGBA(
              clonedImage.getPixelColor(x, y)
            );

            const { r, g, b, a } = mix(
              currentColor,
              partyColor,
              opts.overlayOpacity
            );

            clonedImage.setPixelColor(Jimp.rgbaToInt(r, g, b, a), x, y);
          }
        }
      );

      frames.push(
        new GifFrame(image.bitmap, {
          delayCentisecs: msToCs(opts.frameDelay)
        })
      );
    });

    const { buffer } = await codec.encodeGif(frames);

    return buffer;
  } catch (err) {
    throw new Error(`partyfy error: ${err.message || err}`);
  }
}

function mix(color, overlayedColor, opacity = 60) {
  return {
    r: (overlayedColor.r - color.r) * (opacity / 100) + color.r,
    g: (overlayedColor.g - color.g) * (opacity / 100) + color.g,
    b: (overlayedColor.b - color.b) * (opacity / 100) + color.b,
    a: 1
  };
}

function msToCs(ms) {
  return ms / 10;
}

function csToMs(cs) {
  return cs * 10;
}

module.exports = partyfy;
