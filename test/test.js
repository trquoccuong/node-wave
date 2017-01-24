var render = require('../lib/render')
var fs = require('fs')

render('Canon.mp3', function (err, buffer) {
  fs.writeFileSync('out.png', buffer);
})
