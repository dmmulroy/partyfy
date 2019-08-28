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

    const frames = Array.from(new Array(colors.length)).map(
      () =>
        new GifFrame(
          {
            width: bitmap.width,
            height: bitmap.height,
            data: Buffer.alloc(bitmap.data.length)
          },
          { delayCentisecs: msToCs(75) }
        )
    );

    for (let idx = 0; idx < bitmap.data.length; idx += 4) {
      let pixel = toRGBA(bitmap.data.slice(idx, idx + 5));
      for (let colorIdx = 0; colorIdx < colors.length; colorIdx++) {
        const transformedPixel = transformPixel(
          pixel,
          colors[colorIdx],
          opts.opacity
        );

        frames[colorIdx].bitmap.data[idx] = transformedPixel.r;
        frames[colorIdx].bitmap.data[idx + 1] = transformedPixel.g;
        frames[colorIdx].bitmap.data[idx + 2] = transformedPixel.b;
        frames[colorIdx].bitmap.data[idx + 3] = transformedPixel.a;
      }
    }

    const { buffer } = await codec.encodeGif(frames);

    return buffer;
  } catch (err) {
    throw new Error(`partyfy error: ${err.message || err}`);
  }
}

// Returns a gifwrap/jimp compatible Bitmap object
function asyncGetPixelBitmap(imageBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const { mime } = fileType(imageBuffer);
      getPixels(imageBuffer, mime, (err, { data, shape }) => {
        if (err) return reject(err);

        if (shape.length === 4) {
          return reject('animated gifs are not currently supported');
        }

        resolve({ width: shape[0], height: shape[1], data });
      });
    } catch (err) {
      reject(err);
    }
  });
}

function toRGBA([r, g, b, a]) {
  return { r, g, b, a };
}

function setAlpha({ r, g, b, a }) {
  return { r, g, b, a: a < 127 ? 0x00 : 255 };
}

// Based on luminosity grayscale here: https://docs.gimp.org/2.6/en/gimp-tool-desaturate.html
function grayscale({ r, g, b, a }) {
  const grayLevel = parseInt(0.21 * r + 0.72 * g + 0.07 * b, 10);

  return { r: grayLevel, g: grayLevel, b: grayLevel, a };
}

function grayscaleAverage({ r, g, b, a }) {
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
  const p = mix(setAlpha(grayscale(pixel)), partyColor, opacity);

  return p;
}

function msToCs(ms) {
  return ms / 10;
}

function bytesToMb(bytes) {
  return bytes / Math.pow(1024, 2);
}

module.exports = partyfy;
