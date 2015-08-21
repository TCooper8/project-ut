
exports.add = key => value => obj => {
  obj[key] = value
  return obj
}

exports.containsKey = key => obj =>
  obj[key] !== undefined

exports.empty = { }

exports.exists = predicate => obj => {
  var keys = Object.keys(obj)
  var i = -1
  var length = keys.length
  var key

  while(++i < length) {
    key = keys[i]
    if (predicate(key)(obj[key])) {
      return true
    }
  }

  return false
}

exports.filter = predicate => obj => {
  var keys = Object.key(obj)
  var i = -1
  var length = keys.length
  var acc = { }
  var key, value

  while(++i < length) {
    key = keys[i]
    value = obj[key]
    if (predicate(key)(value))
      acc[key] = value
  }

  return acc
}

exports.find = key => obj =>
  obj[key]

exports.findKey = predicate => obj => {
  var keys = Object.keys(obj)
  var i = -1
  var length = keys.length

  while(++i < length) {
    var key = keys[i]
    var value = obj[key]
    if (predicate(key)(value))
      return key
  }

  return
}

exports.fold = folder => state => obj => {
  var keys = Object.keys(obj)
  var i = -1
  var length = keys.length
  var key, value

  while(++i < length) {
    key = keys[i]
    value = obj[key]
  }
}
