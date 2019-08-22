# partyfy

[![npm version](https://badge.fury.io/js/partyfy.svg)](https://badge.fury.io/js/partyfy)

## Usage

```javascript
const fs = require('fs');
const partyfy = require('partyfy');

(async () => {
  const image = fs.readFileSync('my-image.png');

  const partyImage = await partyfy(image);

  fs.writeFileSynce('my-party-image.gif');
})();
```
