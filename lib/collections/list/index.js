
var listPush = (array, values) => {
  var i = -1
  var length = values.length
  var offset = array.length

  while(++i < length) array[offset + i] = values[i]
  return array
}

var baseFlatten = (list, result) => {
  var i = -1
  var length = list.length
  //var val

  while(++i < length) {
    var val = list[i]
    if (Array.isArray(val)) {
      baseFlatten(val, result)
    }
    else {
      result[result.length] = val
    }
  }

  return result
}

/*
 * val append: 'a list -> 'a list -> 'a list
 * */
exports.append = xs => ys => xs.concat(ys)

/*
 * average: 'a list -> 'b (requires 'a with (/) operator.
 * */
exports.average = list => {
  const length = list.length
  var i = -1
  var acc = 0
  while (++i < length) acc += list[i]
  return acc / length
}

/*
 * averageBy: ('a -> 'b) -> 'a list -> 'a (requires 'a with (/) operator.
 * */
exports.averageBy = projection => list => {
  const length = list.length
  var i = -1
  var acc = 0
  while(++i < length) acc += projection(list[i])
  return acc / length
}

exports.choose = predicate => list => {
  const length = list.length
  var i = -1, j = -1
  var acc = new Array(length / 2)
  var e

  while(++i < length) {
    e = list[i]
    //if (predicate(e) !== undefined) {
    if (predicate(e)) {
      ++j
      acc[j] = e
    }
  }

  return acc
}

exports.collect = mapping => list => {
  const length = list.length
  var i = -1, j = -1, k = -1, l = -1
  var acc = new Array(list.length)
  var ls

  while(++i < length) {
    ls = mapping(list[i])
    j += ls.length
    acc[i] = ls
  }

  // Flatten the list
  var res = new Array(j)
  i = -1
  while(i < j) {
    ls = acc[i];
    l = ls.length
    k = -1

    while(++k < l) {
      ++i
      res[i] = ls[k]
    }
  }

  return res
}

exports.concat = listSeq => {
  var i = -1
  var length = listSeq.length
  var accLen = 0

  // Gather all of the lengths first.
  while(++i < length) accLen += listSeq[i].length

  i = -1
  var acc = new Array(accLen)
  var k = -1

  while(++i < length) {
    var list = listSeq[i]
    var j = -1
    var listLen = list.length
    while(++j < listLen) acc[++k] = list[j]
  }

  return acc
}

exports.empty = () => []

exports.exists = predicate => list => {
  var i = -1
  var length = list.length
  while(++i < length)
    if (predicate(list[i]))
      return true
  return false
}

exports.exists2 = predicate => listA => listB => {
  var length = Math.min(listA.length, listB.length)
  var i = -1

  while(++i < length)
    if (predicate(listA[i], listB[i]))
      return true
  return false
}

exports.flatten = list => {
  return baseFlatten(list, [])
}


