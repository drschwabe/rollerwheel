## rollerwheel

For creating clientside JavaScript bundles. 

No config file necessary.  Allows for mixing CommonJS and ESM in same file (primarily supporting CommonJS; your ESM mileage may vary). 

Under the hood it is a convenience wrapper for an opinionated Rollup and Babel configuration that Just Works™ 


### usage 

*client.js*

##### 
```javascript
//some example deps
const { $j, $click, Grow } = require('html-template-utils') 
import * as d3 from "d3"

console.log('hello world')

//your app code
```

*from your terminal:*

```bash
npm install rollerwheel
npx rollerwheel 
#^ reads "client.js" and outputs browser-ready bundle to "client.bundle.js"

npx rollerwheel -w 
#^ same but watches/re-bundles when client.js is edited 

npx rollerwheel admin.js -w 
#^ reads admin.js and outputs to "admin.bundle.js"

```

If you have a dir called `static` in the same dir from which you call rollerwheel, the bundle will output to said static dir. 

