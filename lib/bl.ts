'use strict'

const DuplexStream = require('readable-stream').Duplex
// const inherits = require('./inherits')
function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}
import BufferList from './BufferList'

type BufferList_type = typeof BufferList.prototype;

type buf_type = Buffer | BufferList_type | Buffer[] | BufferList_type[];

function BufferListStream (callback: Function | buf_type | null) {
  if (!(this instanceof BufferListStream)) {
    return new (BufferListStream as any)(callback)
  }

  if (typeof callback === 'function') {
    this._callback = callback

    const piper = function piper (err: any) {
      if (this._callback) {
        this._callback(err)
        this._callback = null
      }
    }.bind(this)

    this.on('pipe', function onPipe (src: { on: (arg0: string, arg1: any) => void; }) {
      src.on('error', piper)
    })
    this.on('unpipe', function onUnpipe (src: { removeListener: (arg0: string, arg1: any) => void; }) {
      src.removeListener('error', piper)
    })

    callback = null
  }

  BufferList._init.call(this, callback)
  DuplexStream.call(this)
}

inherits(BufferListStream, DuplexStream)
Object.assign(BufferListStream.prototype, BufferList.prototype)

BufferListStream.prototype._new = function _new (callback: Function | null | buf_type) {
  return new (BufferListStream as any)(callback)
}

BufferListStream.prototype._write = function _write (buf: buf_type, encoding, callback : Function) {
  this._appendBuffer(buf)

  if (typeof callback === 'function') {
    callback()
  }
}

BufferListStream.prototype._read = function _read (size: number) {
  if (!this.length) {
    return this.push(null)
  }

  size = Math.min(size, this.length)
  this.push(this.slice(0, size))
  this.consume(size)
}

BufferListStream.prototype.end = function end (chunk) {
  DuplexStream.prototype.end.call(this, chunk)

  if (this._callback) {
    this._callback(null, this.slice())
    this._callback = null
  }
}

BufferListStream.prototype._destroy = function _destroy (err, cb: Function) {
  this._bufs.length = 0
  this.length = 0
  cb(err)
}

BufferListStream.prototype._isBufferList = function _isBufferList (b: any) {
  return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b)
}

BufferListStream.isBufferList = BufferList.isBufferList

module.exports = BufferListStream
module.exports.BufferListStream = BufferListStream
module.exports.BufferList = BufferList
