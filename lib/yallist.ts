'use strict'

export default class Yallist{
  tail
  head
  length: number
  static Node
  constructor(list?) {
    this.tail = null
    this.head = null
    this.length = 0

    if (list && typeof list.forEach === 'function') {
      list.forEach(function (item) {
        this.push(item)
      })
    } else if (arguments.length > 0) {
      for (var i = 0, l = arguments.length; i < l; i++) {
        this.push(arguments[i])
      }
    }
  }
  removeNode(node) {
    if (node.list !== this) {
      throw new Error('removing node which does not belong to this list')
    }

    var next = node.next
    var prev = node.prev

    if (next) {
      next.prev = prev
    }

    if (prev) {
      prev.next = next
    }

    if (node === this.head) {
      this.head = next
    }
    if (node === this.tail) {
      this.tail = prev
    }

    node.list.length--
    node.next = null
    node.prev = null
    node.list = null

    return next
  }

  unshiftNode(node) {
    if (node === this.head) {
      return
    }

    if (node.list) {
      node.list.removeNode(node)
    }

    var head = this.head
    node.list = this
    node.next = head
    if (head) {
      head.prev = node
    }

    this.head = node
    if (!this.tail) {
      this.tail = node
    }
    this.length++
  }

  push(node) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      push(this, arguments[i])
    }
    return this.length
  }

  unshift(node) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      unshift(this, arguments[i])
    }
    return this.length
  }
  forEach(fn, thisp) {
    thisp = thisp || this
    for (var walker = this.head, i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this)
      walker = walker.next
    }
  }
}
  

function push (self, item) {
  self.tail = new node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

class node{
  value
  next
  prev
  list
  constructor(value, prev, next, list) {
    this.value = value
    this.list = list
    if (prev) {
      prev.next = this
      this.prev = prev
    } else {
      this.prev = null
    }

    if (next) {
      next.prev = this
      this.next = next
    } else {
      this.next = null
    }
  }
}
