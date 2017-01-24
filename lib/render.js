var AudioContext = require('web-audio-api').AudioContext
var fs = require('fs')
var Canvas = require('canvas')

var defaultSetting = {
  width: 600,
  height: 80,
  barWidth: 3,
  barGap: 0.2,
  waveColor: 'gray',
  waveAlpha: 1,
  backgroundColor: '#fff',
  backgroundImage: '',
  baseline: 40,
  padding: 10,
  baselineWidth: 0,
  baselineColor: 'white'
}

module.exports = function render (url, options, cb) {
  var audioContext = new AudioContext()
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  options = Object.assign({}, defaultSetting, options)
  if (options.baseline < 0 && options.height < 0 && options.width < 0) {
    return cb(new Error('Size must be greater than 0'))
  }

  if (options.baseline > options.height) {
    return cb(new Error('Baseline must be smaller than waveform height'))
  }

  var canvas = new Canvas(options.width, options.height)
  var canvasContext = canvas.getContext('2d')
  fs.readFile(url, function (err, buffer) {
    if (err) return cb(err)

    audioContext.decodeAudioData(buffer, function (result) {
      var data = result.getChannelData(0)
      var step = Math.floor(data.length / options.width)
      var ratio = options.baseline / options.height
      var vals = []

      canvasContext.fillStyle = options.backgroundColor
      canvasContext.fillRect(0, 0, options.width, options.height)

      canvasContext.fillStyle = options.waveColor

      for (var i = 0; i < options.width; i += options.barWidth) {
        var position = i * step
        var sum = 0.0
        for (var j = position; j <= (position + step) - 1; j++) {
          sum += Math.pow(data[j], 2)
        }
        vals.push(Math.sqrt(sum / data.length) * 10000)
      }

      var maxValue = Math.max.apply(null, vals)

      vals.forEach(function (val, index) {
        var scale = options.height / maxValue
        val *= scale
        var w = options.barWidth
        if (options.barGap !== 0) {
          w *= Math.abs(1 - options.barGap)
        }
        var x = index * options.barWidth + (w / 2)

        var lowerHeight = val * ratio

        if (lowerHeight < options.padding) {
          lowerHeight = 1
        } else {
          lowerHeight -= options.padding
        }

        var upperHeight = val * (1 - ratio)

        if (upperHeight < options.padding) {
          upperHeight = 1
        } else {
          upperHeight -= options.padding
        }

        if (options.waveAlpha < 1) {
          canvasContext.clearRect(x, options.baseline, w, upperHeight)
          canvasContext.clearRect(x, options.baseline, w, -lowerHeight)
          canvasContext.globalAlpha = options.waveAlpha
        }
        canvasContext.fillRect(x, options.baseline, w, upperHeight)
        canvasContext.fillRect(x, options.baseline, w, -lowerHeight)
      })

      if (options.baselineWidth >= 1) {
        canvasContext.fillStyle = options.baselineColor
        canvasContext.fillRect(0, options.baseline - (options.baselineWidth / 2), options.width, options.baselineWidth)
      }
      cb(null, canvas.toBuffer())
    })
  })
}
