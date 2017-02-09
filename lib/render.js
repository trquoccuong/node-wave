var spawn = require('child_process').spawn
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
//https://github.com/jhurliman/node-pcm
function getPcmData (filename, options, sampleCallback, endCallback) {
  var outputStr = ''
  var oddByte = null
  var channel = 0
  var gotData = false

  options = options || {}
  var channels = 2
  if (typeof options.stereo !== 'undefined') {
    channels = (options.stereo) ? 2 : 1
  }
  var sampleRate = 44100
  if (typeof options.sampleRate !== 'undefined') {
    sampleRate = options.sampleRate
  }

  var ffmpeg = spawn('ffmpeg', ['-i', filename, '-f', 's16le', '-ac', channels,
    '-acodec', 'pcm_s16le', '-ar', sampleRate, '-y', 'pipe:1'])

  ffmpeg.stdout.on('data', function (data) {
    gotData = true

    var value
    var i = 0
    var dataLen = data.length

    // If there is a leftover byte from the previous block, combine it with the
    // first byte from this block
    if (oddByte !== null) {
      value = ((data.readInt8(i++, true) << 8) | oddByte) / 32767.0
      sampleCallback(value, channel)
      channel = ++channel % 2
    }

    for (; i < dataLen; i += 2) {
      value = data.readInt16LE(i, true) / 32767.0
      sampleCallback(value, channel)
      channel = ++channel % 2
    }

    oddByte = (i < dataLen) ? data.readUInt8(i, true) : null
  })

  ffmpeg.stderr.on('data', function (data) {
    outputStr += data.toString()
  })

  ffmpeg.stderr.on('end', function () {
    if (gotData) {
      endCallback(null, outputStr)
    } else {
      endCallback(outputStr, null)
    }
  })
}

module.exports = function render (url, options, cb) {
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
  var data = []

  getPcmData(url, null, function (sample, channel) {
    if (channel === 0) {
      data.push(sample)
    }
  }, function (err) {

    if (err) {
      return cb(err)
    }

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
}
