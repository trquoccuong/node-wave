var render = require('../lib/render')
var fs = require('fs')

render('Canon.mp3', function (err, buffer) {
  if (err) return err
  fs.writeFileSync('out.png', buffer)
})
