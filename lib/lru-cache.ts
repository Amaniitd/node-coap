
const perf =
  typeof performance === 'object' &&
  performance &&
  typeof performance.now === 'function'
    ? performance
    : Date

const isPosInt = (n: string | number) => n && n === Math.floor(n) && n > 0 && isFinite(n)

class ZeroArray extends Array {
  constructor(size: number | undefined) {
    super(size)
    this.fill(0)
  }
}


class Stack {
  heap: any
  length: number
  constructor(max: number) {
    if (max === 0) {
      return []
    }
    const UintArray = getUintArray(max)
    this.heap = new UintArray(max)
    this.length = 0
  }
  push(n: any) {
    this.heap[this.length++] = n
  }
  pop() {
    return this.heap[--this.length]
  }
}

const getUintArray = (max: string | number) =>
  !isPosInt(max)
    ? null
    : max <= Math.pow(2, 8)
    ? Uint8Array
    : max <= Math.pow(2, 16)
    ? Uint16Array
    : max <= Math.pow(2, 32)
    ? Uint32Array
    : max <= Number.MAX_SAFE_INTEGER
    ? ZeroArray
            : null
    
const shouldWarn = (code: unknown) => !warned.has(code)
const warned = new Set()

const emitWarning = (...a: string[]) => {
  typeof process === 'object' &&
  process &&
  typeof process.emitWarning === 'function' ? process.emitWarning(...(a as []) : console.error(...a)
}

class LRUCache {
  [x: string]: any
  fetchContext: any
  fetchMethod: any
  maxSize: number
  max: number
  ttl: number
  sizeCalculation: number
  size: number
  keyMap: Map<any, number>
  keyList: any[]
  valList: any[]
  next: ZeroArray | Uint32Array | Uint16Array | Uint8Array
  prev: ZeroArray | Uint32Array | Uint16Array | Uint8Array
  head: number
  tail: number
  free: any
  initialFill: number
  ttlAutopurge: any
  dispose: optiontype
  disposeAfter: optiontype
  disposed: any[] | null 
  noDisposeOnSet: boolean
  noUpdateTTL: boolean
  noDeleteOnFetchRejection: boolean
  allowStale: boolean
  noDeleteOnStaleGet: boolean
  updateAgeOnGet: boolean
  updateAgeOnHas: boolean
  ttlResolution: any
  ttls: any
  starts: any
  sizes: any
  calculatedSize: number
  updateItemAge: (index: any) => void
  getRemainingTTL: (key: any) => number




  constructor(options: optiontype) {
    const {
      max = 0,
      ttl,
      ttlResolution = 1,
      ttlAutopurge,
      updateAgeOnGet,
      updateAgeOnHas,
      allowStale,
      dispose,
      disposeAfter,
      noDisposeOnSet,
      noUpdateTTL,
      maxSize = 0,
      sizeCalculation,
      fetchMethod,
      fetchContext,
      noDeleteOnFetchRejection,
      noDeleteOnStaleGet,
    } = options
    const { length, maxAge, stale } =
      options instanceof LRUCache ? {} : options

    if (max !== 0 && !isPosInt(max)) {
      throw new TypeError('max option must be a nonnegative integer')
    }

    const UintArray = max ? getUintArray(max) : Array
    if (!UintArray) {
      throw new Error('invalid max value: ' + max)
    }

    this.max = max
    this.maxSize = maxSize
    this.sizeCalculation = sizeCalculation || length
    if (this.sizeCalculation) {
      if (!this.maxSize) {
        throw new TypeError(
          'cannot set sizeCalculation without setting maxSize'
        )
      }
      if (typeof this.sizeCalculation !== 'function') {
        throw new TypeError('sizeCalculation set to non-function')
      }
    }

    this.fetchMethod = fetchMethod || null
    if (this.fetchMethod && typeof this.fetchMethod !== 'function') {
      throw new TypeError(
        'fetchMethod must be a function if specified'
      )
    }

    this.fetchContext = fetchContext
    if (!this.fetchMethod && fetchContext !== undefined) {
      throw new TypeError(
        'cannot set fetchContext without fetchMethod'
      )
    }

    this.keyMap = new Map()
    this.keyList = new Array(max).fill(null)
    this.valList = new Array(max).fill(null)
    this.next = new UintArray(max)
    this.prev = new UintArray(max)
    this.head = 0
    this.tail = 0
    this.free = new Stack(max)
    this.initialFill = 1
    this.size = 0

    if (typeof dispose === 'function') {
      this.dispose = dispose
    }
    if (typeof disposeAfter === 'function') {
      this.disposeAfter = disposeAfter
      this.disposed = []
    } else {
      this.disposeAfter = null
      this.disposed = null
    }
    this.noDisposeOnSet = !!noDisposeOnSet
    this.noUpdateTTL = !!noUpdateTTL
    this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection

    if (this.maxSize !== 0) {
      if (!isPosInt(this.maxSize)) {
        throw new TypeError(
          'maxSize must be a positive integer if specified'
        )
      }
      this.initializeSizeTracking()
    }

    this.allowStale = !!allowStale || !!stale
    this.noDeleteOnStaleGet = !!noDeleteOnStaleGet
    this.updateAgeOnGet = !!updateAgeOnGet
    this.updateAgeOnHas = !!updateAgeOnHas
    this.ttlResolution =
      isPosInt(ttlResolution) || ttlResolution === 0
        ? ttlResolution
        : 1
    this.ttlAutopurge = !!ttlAutopurge
    this.ttl = ttl || maxAge || 0
    if (this.ttl) {
      if (!isPosInt(this.ttl)) {
        throw new TypeError(
          'ttl must be a positive integer if specified'
        )
      }
      this.initializeTTLTracking()
    }

    // do not allow completely unbounded caches
    if (this.max === 0 && this.ttl === 0 && this.maxSize === 0) {
      throw new TypeError(
        'At least one of max, maxSize, or ttl is required'
      )
    }
    if (!this.ttlAutopurge && !this.max && !this.maxSize) {
      const code = 'LRU_CACHE_UNBOUNDED'
      if (shouldWarn(code)) {
        warned.add(code)
        const msg =
          'TTL caching without ttlAutopurge, max, or maxSize can ' +
          'result in unbounded memory consumption.'
        emitWarning(msg, 'UnboundedCacheWarning', code, LRUCache)
      }
    }

    if (stale) {
      deprecatedOption('stale', 'allowStale')
    }
    if (maxAge) {
      deprecatedOption('maxAge', 'ttl')
    }
    if (length) {
      deprecatedOption('length', 'sizeCalculation')
    }
  }

  purne() {
    let deleted = false
    for (const i of this.rindexes({ allowStale: true })) {
      if (this.isStale(i)) {
        this.delete(this.keyList[i])
        deleted = true
      }
    }
    return deleted
  }
  

  reset() {
    for (const index of this.rindexes({ allowStale: true })) {
      const v = this.valList[index]
      if (this.isBackgroundFetch(v)) {
        v.__abortController.abort()
      } else {
        const k = this.keyList[index]
        this.dispose(v, k, 'delete')
        if (this.disposeAfter) {
          this.disposed.push([v, k, 'delete'])
        }
      }
    }
    this.keyMap.clear()
    this.valList.fill(null)
    this.keyList.fill(null)
    if (this.ttls) {
      this.ttls.fill(0)
      this.starts.fill(0)
    }
    if (this.sizes) {
      this.sizes.fill(0)
    }
    this.head = 0
    this.tail = 0
    this.initialFill = 1
    this.free.length = 0
    this.calculatedSize = 0
    this.size = 0
    if (this.disposed) {
      while (this.disposed.length) {
        this.disposeAfter(...this.disposed.shift())
      }
    }
  }

  peek(k: any, { allowStale = this.allowStale } = {}) {
    const index = this.keyMap.get(k)
    if (index !== undefined && (allowStale || !this.isStale(index))) {
      return this.valList[index]
    }
  }
  del(k: any) {
    let deleted = false
    if (this.size !== 0) {
      const index = this.keyMap.get(k)
      if (index !== undefined) {
        deleted = true
        if (this.size === 1) {
          this.clear()
        } else {
          this.removeItemSize(index)
          const v = this.valList[index]
          if (this.isBackgroundFetch(v)) {
            v.__abortController.abort()
          } else {
            this.dispose(v, k, 'delete')
            if (this.disposeAfter) {
              this.disposed.push([v, k, 'delete'])
            }
          }
          this.keyMap.delete(k)
          this.keyList[index] = null
          this.valList[index] = null
          if (index === this.tail) {
            this.tail = this.prev[index]
          } else if (index === this.head) {
            this.head = this.next[index]
          } else {
            this.next[this.prev[index]] = this.next[index]
            this.prev[this.next[index]] = this.prev[index]
          }
          this.size--
          this.free.push(index)
        }
      }
    }
    if (this.disposed) {
      while (this.disposed.length) {
        this.disposeAfter(...this.disposed.shift())
      }
    }
    return deleted
  }
  clear() {
    throw new Error("Method not implemented.")
  }
  removeItemSize(index: number) {
    throw new Error("Method not implemented.")
  }

  set(
    k: any,
    v: any,
    {
      ttl = this.ttl,
      start,
      noDisposeOnSet = this.noDisposeOnSet,
      size = 0,
      sizeCalculation = this.sizeCalculation,
      noUpdateTTL = this.noUpdateTTL,
    } = {}
  ) {
    size = this.requireSize(k, v, size, sizeCalculation)
    let index = this.size === 0 ? undefined : this.keyMap.get(k)
    if (index === undefined) {
      // addition
      index = this.newIndex()
      this.keyList[index] = k
      this.valList[index] = v
      this.keyMap.set(k, index)
      this.next[this.tail] = index
      this.prev[index] = this.tail
      this.tail = index
      this.size++
      this.addItemSize(index, v, k, size)
      noUpdateTTL = false
    } else {
      // update
      const oldVal = this.valList[index]
      if (v !== oldVal) {
        if (this.isBackgroundFetch(oldVal)) {
          oldVal.__abortController.abort()
        } else {
          if (!noDisposeOnSet) {
            this.dispose(oldVal, k, 'set')
            if (this.disposeAfter) {
              this.disposed.push([oldVal, k, 'set'])
            }
          }
        }
        this.removeItemSize(index)
        this.valList[index] = v
        this.addItemSize(index, v, k, size)
      }
      this.moveToTail(index)
    }
    if (ttl !== 0 && this.ttl === 0 && !this.ttls) {
      this.initializeTTLTracking()
    }
    if (!noUpdateTTL) {
      this.setItemTTL(index, ttl, start)
    }
    if (this.disposeAfter) {
      while (this.disposed.length) {
        this.disposeAfter(...this.disposed.shift())
      }
    }
    return this
  }
  
  initializeSizeTracking() {
    this.calculatedSize = 0
    this.sizes = new ZeroArray(this.max)
    this.removeItemSize = index =>
      (this.calculatedSize -= this.sizes[index])
    this.requireSize = (k: any, v: any, size: string | number, sizeCalculation: (arg0: any, arg1: any) => any) => {
      if (!isPosInt(size)) {
        if (sizeCalculation) {
          if (typeof sizeCalculation !== 'function') {
            throw new TypeError('sizeCalculation must be a function')
          }
          size = sizeCalculation(v, k)
          if (!isPosInt(size)) {
            throw new TypeError(
              'sizeCalculation return invalid (expect positive integer)'
            )
          }
        } else {
          throw new TypeError(
            'invalid size value (must be positive integer)'
          )
        }
      }
      return size
    }
    this.addItemSize = (index: string | number, v: any, k: any, size: any) => {
      this.sizes[index] = size
      const maxSize = this.maxSize - this.sizes[index]
      while (this.calculatedSize > maxSize) {
        this.evict(true)
      }
      this.calculatedSize += this.sizes[index]
    }
  }
  evict(arg0: boolean) {
    throw new Error("Method not implemented.")
  }
  initializeTTLTracking() {
    this.ttls = new ZeroArray(this.max)
    this.starts = new ZeroArray(this.max)

    this.setItemTTL = (index: string | number, ttl: number, start = perf.now()) => {
      this.starts[index] = ttl !== 0 ? start : 0
      this.ttls[index] = ttl
      if (ttl !== 0 && this.ttlAutopurge) {
        const t = setTimeout(() => {
          if (this.isStale(index)) {
            this.delete(this.keyList[index])
          }
        }, ttl + 1)
        /* istanbul ignore else - unref() not supported on all platforms */
        if (t.unref) {
          t.unref()
        }
      }
    }
    this.updateItemAge = index => {
      this.starts[index] = this.ttls[index] !== 0 ? perf.now() : 0
    }

    // debounce calls to perf.now() to 1s so we're not hitting
    // that costly call repeatedly.
    let cachedNow = 0
    const getNow = () => {
      const n = perf.now()
      if (this.ttlResolution > 0) {
        cachedNow = n
        const t = setTimeout(
          () => (cachedNow = 0),
          this.ttlResolution
        )
        /* istanbul ignore else - not available on all platforms */
        if (t.unref) {
          t.unref()
        }
      }
      return n
    }
    this.getRemainingTTL = key => {
      const index = this.keyMap.get(key)
      if (index === undefined) {
        return 0
      }
      return this.ttls[index] === 0 || this.starts[index] === 0
        ? Infinity
        : this.starts[index] +
            this.ttls[index] -
            (cachedNow || getNow())
    }

    this.isStale = (index: string | number) => {
      return (
        this.ttls[index] !== 0 &&
        this.starts[index] !== 0 &&
        (cachedNow || getNow()) - this.starts[index] >
          this.ttls[index]
      )
    }
  }

}