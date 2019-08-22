# partyfy

[![npm version](https://badge.fury.io/js/partyfy.svg)](https://badge.fury.io/js/partyfy)

## Usage

### `partyfy(file[, options])`

  * file `<Buffer>`
  * options `<Object>`
    * frameDelay `<number>` Speed in milliseconds between frames. Default: 75
    * overlayOpacity `<number>` Opacity of the overlayed party color (0 - 100). Default: 60
  
  Returns `<Promise<Buffer>>`
 
## Example

```javascript
const fs = require('fs');
const partyfy = require('partyfy');

(async () => {
  const image = fs.readFileSync('my-image.png');

  const partyImage = await partyfy(image);

  fs.writeFileSynce('my-party-image.gif');
})();
```

## npx (experimental)
`npx partyfy my-image.png my-party-image.gif`

