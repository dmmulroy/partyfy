const getPixels = require('get-pixels');
const fileType = require('file-type');
const { GifCodec, GifFrame, GifUtil, BitmapImage } = require('gifwrap');

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
    const frames = await readFrames(imageBuffer, opts);

    frames.forEach(({ bitmap }, frameIdx) => {
      for (let idx = 0; idx < bitmap.data.length; idx += 4) {
        let pixel = toRGBA(bitmap.data.slice(idx, idx + 5));

        const { r, g, b, a } = transformPixel(
          pixel,
          colors[frameIdx % colors.length],
          opts.overlayOpacity
        );

        [r, g, b, a].forEach((channel, i) => {
          bitmap.data[idx + i] = channel;
        });
      }
    });

    const { buffer } = await codec.encodeGif(frames);

    return buffer;
  } catch (err) {
    throw new Error(`partyfy error: ${err.message || err}`);
  }
}

// Returns gifwrap/jimp compatible frames
async function readFrames(imageBuffer, opts) {
  const { mime } = fileType(imageBuffer);
  console.log('mime', mime);

  switch (mime) {
    case 'image/gif': {
      const { frames } = await GifUtil.read(imageBuffer);

      if (frames.length > 1) {
        if (opts.frameDelay != defaultOptions.frameDelay) {
          console.warn(
            'Warning: frameDelay is currently ignored for animated gifs.\n'
          );
        }

        return frames;
      } else {
        return colors.map(
          () =>
            new GifFrame(new BitmapImage(frames[0]), {
              delayCentisecs: msToCs(opts.frameDelay)
            })
        );
      }
    }
    case 'image/png':
    case 'image/jpg':
    case 'image/jpeg':
      return new Promise((resolve, reject) => {
        try {
          getPixels(imageBuffer, mime, (err, { data, shape }) => {
            if (err) return reject(err);

            resolve(
              colors.map(
                () =>
                  new GifFrame(
                    {
                      width: shape[0],
                      height: shape[1],
                      data: Buffer.from(data)
                    },
                    { delayCentisecs: msToCs(opts.frameDelay) }
                  )
              )
            );
          });
        } catch (err) {
          reject(err);
        }
      });
  }

  throw new Error('Invalid file format.');
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
