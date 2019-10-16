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

  fs.writeFileSync('my-party-image.gif', partyImage);
})();
```

## npx/cli

`npx partyfy` or `npm i partyfy -G`
```
Usage: partyfy <source> <dest> [options]

A CLI for partyfy.

Options:
  -V, --version          output the version number
  -d, --delay <ms>       The Speed in milliseconds between frames. (default: 75)
  -o, --opacity <value>  Opacity of the overlayed party color (0 - 100). (default: 60)
  -h, --help             output usage information
```

