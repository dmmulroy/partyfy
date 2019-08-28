const getPixels = require('get-pixels');
const fileType = require('file-type');
const { GifCodec, GifFrame } = require('gifwrap');

const codec = new GifCodec();

const colors = [
  { r: 255, g: 141, b: 139 },
  { r: 254, g: 214, b: 137 },
  { r: 136, g: 255, b: 137 },
  { r: 135, g: 255, b: 255 },
  { r: 139, g: 181, b: 254 },
  { r: 215, g: 140, b: 255 },
  { r: 255, g: 140, b: 255 },
  { r: 255, g: 104, b: 247 },
  { r: 254, g: 108, b: 183 },
  { r: 255, g: 105, b: 104 }
];

const defaultOptions = {
  overlayOpacity: 60,
  frameDelay: 75
};

async function partyfy(imageBuffer, options = defaultOptions) {
  try {
    const opts = { ...defaultOptions, ...options };
    const bitmap = await asyncGetPixelBitmap(imageBuffer);
    const frames = Array.from(new Array(colors.length)).map(() => ({
      width: bitmap.width,
      height: bitmap.height,
      data: Buffer.alloc(bitmap.data.length)
    }));

    for (let idx = 0; idx < bitmap.data.length; idx += 4) {
      let pixel = toRGBAObject(bitmap.data.slice(idx, idx + 5));
      for (let colorIdx = 0; colorIdx < colors.length; colorIdx++) {
        const transformedPixel = transformPixel(
          pixel,
          colors[colorIdx],
          opts.opacity
        );

        frames[colorIdx].data[idx] = transformedPixel.r;
        frames[colorIdx].data[idx + 1] = transformedPixel.g;
        frames[colorIdx].data[idx + 2] = transformedPixel.b;
        frames[colorIdx].data[idx + 3] = transformedPixel.a;
      }
    }

    const { buffer } = await codec.encodeGif(
      frames.map(
        frame =>
          new GifFrame(frame, {
            delayCentisecs: msToCs(opts.frameDelay)
          })
      )
    );

    return buffer;
  } catch (err) {
    console.error(err);
    throw new Error(`partyfy error: ${err.message || err}`);
  }
}

// Returns a gifwrap/jimp compatible Bitmap object
function asyncGetPixelBitmap(imageBuffer) {
  return new Promise((resolve, reject) => {
    try {
      getPixels(
        imageBuffer,
        fileType(imageBuffer).mime,
        (err, { data, shape }) => {
          if (err) return reject(err);

          resolve({ width: shape[0], height: shape[1], data });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

function toRGBAObject([r, g, b, a]) {
  return { r, g, b, a };
}

function toRGBAArray({ r, g, b, a }) {
  return [r, g, b, a];
}

function setAlpha({ r, g, b, a }) {
  return { r, g, b, a: a >= 255 ? 255 : 0x00 };
}

// Based on luminosity grayscale here: https://docs.gimp.org/2.6/en/gimp-tool-desaturate.html
function grayscaleV1({ r, g, b, a }) {
  const grayLevel = 0.21 * r + 0.72 * g + 0.07 * b;

  return { r: grayLevel, g: grayLevel, b: grayLevel, a };
}

function grayscale({ r, g, b, a }) {
  const average = (r + g + b) / 3;

  return { r: average, g: average, b: average, a };
}

function mix(color, overlayedColor, opacity = 60) {
  return {
    r: (overlayedColor.r - color.r) * (opacity / 100) + color.r,
    g: (overlayedColor.g - color.g) * (opacity / 100) + color.g,
    b: (overlayedColor.b - color.b) * (opacity / 100) + color.b,
    a: color.a
  };
}

function transformPixel(pixel, partyColor, opacity = 60) {
  return mix(grayscale(setAlpha(pixel)), partyColor, opacity);
}

function msToCs(ms) {
  return ms / 10;
}

module.exports = partyfy;
