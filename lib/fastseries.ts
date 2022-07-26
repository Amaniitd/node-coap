'use strict'

var defaults = {
  results: true
}

export default function fastseries (options?) {
  options = Object.assign({}, defaults, options)

  var seriesEach: Function
  var seriesList: Function

  if (options.results) {
    seriesEach = resultEach
    seriesList = resultList
  } else {
    seriesEach = noResultEach
    seriesList = noResultList
  }

  return series

  function series (that, toCall, arg, done) {
    done = (done || nop).bind(that)

    if (toCall.length === 0) {
      done.call(that)
    } else if (toCall.bind) {
      if (that) {
        toCall = toCall.bind(that)
      }
      seriesEach(toCall, arg, done)
    } else {
      var _list
      if (that) {
        var length = toCall.length
        _list = new Array(length)
        for (var i = 0; i < length; i++) {
          _list[i] = toCall[i].bind(that)
        }
      } else {
        _list = toCall
      }

      seriesList(_list, arg, done)
    }
  }
}

function noResultEach (each: any, list: string | any[], cb: () => void) {
  var i = 0
  var length = list.length

  release()

  function release () {
    if (i < length) {
      makeCallTwo(each, list[i++], release)
    } else {
      cb()
    }
  }
}

function noResultList (list: string | any[], arg: any, cb: () => void) {
  var i = 0
  var length = list.length
  var makeCall: (cb: any, arg: any, release: any) => void

  if (list[0].length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  release()

  function release () {
    if (i < length) {
      makeCall(list[i++], arg, release)
    } else {
      cb()
    }
  }
}

function resultEach (each, list, cb) {
  var i = 0
  var length = list.length
  var results = new Array(length)

  release(null, null)

  function release (err, result) {
    if (err) {
      cb(err)
      return
    }

    if (i > 0) {
      results[i - 1] = result
    }

    if (i < length) {
      makeCallTwo(each, list[i++], release)
    } else {
      cb(null, results)
    }
  }
}

function resultList (list, arg, cb) {
  var i = 0
  var length = list.length
  var makeCall

  if (list[0].length === 1) {
    makeCall = makeCallOne
  } else {
    makeCall = makeCallTwo
  }

  var results = new Array(length)

  release(null, null)

  function release (err, result) {
    if (err) {
      cb(err)
      return
    }

    if (i > 0) {
      results[i - 1] = result
    }

    if (i < length) {
      makeCall(list[i++], arg, release)
    } else {
      cb(null, results)
    }
  }
}

function makeCallOne (cb: (arg0: any) => void, arg: any, release: any) {
  cb(release)
}

function makeCallTwo (cb, arg, release) {
  cb(arg, release)
}

function nop () { }
