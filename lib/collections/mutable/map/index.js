
var System = require('../../../system')

var Exn = System.Exn

function Map() { }

// add: (key: 'K) -> (value: 'V) -> Map<'K, 'V>
Map.prototype.add = key => {
  var self = this

  return value => {
    self[key] = value
    return self
  }
}

// addTuple: (tuple: Tuple<'K, 'V>) -> Map<'K, 'V>
Map.prototype.addTuple = tuple => {
  this[tuple.first] = tuple.second
  return this
}

// addPair: (pair: { key: 'K, value: 'V }) -> Map<'K, 'V>
Map.prototype.addPair = pair => {
  this[pair.key] = pair.value
  return this
}

// containsKey: (key: 'K) -> bool
Map.prototype.containsKey = key =>
  this[key] != undefined

// count: unit -> int
Map.prototype.count = () =>
  Object.keys(this).length

// val exists: ('K -> 'V -> bool) -> bool
Map.prototype.exists = predicate => {
  var keys = Object.keys(this)
  var i = -1
  var length = keys.length
  var key

  while(++i < length) {
    key = keys[i]
    if (predicate(key)(this[key])) {
      return true
    }
  }

  return false
}

// val filter: ('K -> 'V -> bool) -> Map<'K, 'V>
Map.prototype.filter = predicate => {
  var keys = Object.keys(this)
  var i = -1
  var length = keys.length
  var key, value
  var acc = new Map()

  while(++i < length) {
    key = keys[i], value = this[key]

    if (predicate(key)(value)) {
      acc[key] = value
    }
  }

  return acc
}

Map.prototype.fold = (folder, state) => {
  var keys = Object.keys(this)
  var length = keys.length
  var i = -1
  var acc = state
  var key, value

  while(++i < length) {
    key = keys[i], value = this[key]
    acc = folder(acc, key, value)
  }

  return acc
}

//Map.prototype.fold = folder => {
//  var self = this
//  return state => {
//    var keys = Object.keys(self)
//    var length = keys.length
//    var i = -1
//    var acc = state
//    var key, value
//
//    while(++i < length) {
//      key = keys[i]
//      value = self[key]
//
//      acc = folder(acc)(key)(value)
//    }
//
//    return acc
//  }
//}

// isEmpty: unit -> bool
Map.prototype.isEmpty = () =>
  Object.keys(this).length === 0

/*
 * val get: (key: 'K) -> 'V
 * throws KeyNotFoundException if the key is not found.
 * */
Map.prototype.get = key => {
  var value = this[key]
  if (value == undefined || value == null)
    throw Exn('KeyNotFoundException', sprintf('The key %s, cannot be gotten from the map', key))
  return value
}

Map.prototype.map = mapping => {
  var keys = Object.keys(this)
  var length = keys.length
}

// val remove: (key: 'K) -> Map<'K, 'V>
Map.prototype.remove = key => {
  delete this[key]
  return this
}

// val tryFind: (key: 'K) -> Option<'V>
Map.prototype.tryFind = key =>
  System.Option(this[key])

module.exports = () => {
  return new Map()
}
