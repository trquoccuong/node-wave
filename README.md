# Node wave
> Render audio waveform like SoundCloud on backend

Now we have 2 version 0.0.4 and 0.0.3

0.0.4:  I used `ffmpeg`, It take less cpu and memory than version 0.0.3 but you need to install `ffmpeg`
## Install

```
$ npm install node-wave
```

## How to use

Use with express:

```javascript

var Waveform = require('node-waveform')
var fs = require('fs')

Waveform('< mp3 link >', options, function(err , buffer) {
  fs.writeFileSync('out.png', buffer)
})
```

## Requirement
 This module base on `web-audio-api` and `canvas` modules.
 You need to install `Cairo`. Follow install `canvas` instructor https://www.npmjs.com/package/canvas
 
## Attribute

| Option  | Desciption | Default |
| ------------- | ------------- | ------------- |
| width | Image width | 600px |
| height | Image height | 80px |
| barWidth | bar height | 3px |
| barGrap | space between 2 bar | 0.2 |
| waveColor | bar color | gray |
| waveAlpha | bar opacity | 1 |
| backgroundColor | Image background color | #fff |
| backgroundImage | setup image background |  |
| baseline | center of waveform | 40 |
| padding | Top and bottom padding | 10 |
| baselineWidth | baseline width | 1 |
| baselineColor | baseline color | white |

### The MIT License (MIT)

Copyright (c) <2017> Tran Quoc Cuong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
