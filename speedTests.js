'use strict'

let _ = require('lodash')
let List = require('./lib/collections/').List
let MutableMap = require('./lib/collections/mutable/map')
let Assert = require('assert')

let helpers = {
  averageBy: i => i * i,
  choose: i => i % 3 === 0 ? false : i,
}

let listTests = {
  average: list => List.average(list),
  averageBy: List.averageBy(helpers.averageBy),
  choose: List.choose(helpers.choose),
  concat: List.concat,
  flatten: list => List.flatten(list)
}

let lodashListTests = {
  average: list => _.sum(list) / list.length,
  averageBy: list => _.sum(_.map(list, helpers.averageBy)) / list.length,
  choose: list => _.filter(list, helpers.choose),
  concat: _.flatten,
  flatten: _.flattenDeep
}

let mapHelpers = {
  folder: (acc, key, value) => acc + value
  //folder: acc => key => value => acc + value
}

let mapTests = {
  fold: map => {
    return map.fold(mapHelpers.folder, 0)
  }
}

let lodashMapHelpers = {
  folder: (acc, value, key) => acc + value
}

let lodashMapTests = {
  fold: map => _.reduce(map, lodashMapHelpers.folder, 0)
}

let collections = {
  list: listTests,
  '_list': lodashListTests,
  map: mapTests,
  '_map': lodashMapTests
}

let testRules = method => {
  return [ o => o, parseInt, parseInt ]
}

let listMake = {
  average: _.range,
  averageBy: _.range,
  choose: _.range,
  concat: len => _.map(_.range(len), i => _.range(Math.log10(len))),
  flatten: length => {
    let ls = [1, [2,3], [4, [5, [6]]]]
    return _.map(_.range(length / 6), i => ls)
  }
}

let mapMake = {
  fold: length => {
    return _.reduce(_.range(length), (acc, i) =>
      acc.add(i)(i),
      MutableMap() )
  }
}

let lodashMapMake = {
  fold: length => {
    return _.reduce(_.range(length), (acc, i) =>
      _.set(acc, i, i),
      Object() )
  }
}

let make = {
  'list': listMake,
  '_list': listMake,
  'map': mapMake,
  '_map': lodashMapMake
}

let tests = method => collection => tests => length => {
  let fn = collections[collection][method]
  let list = make[collection][method](length)

  let i = collection.indexOf('_')
  let expect
  if (i === -1) {
    expect = collections['_' + collection][method](list)
  }
  else {
    expect = collections[collection][method](list)
  }

  console.log(fn(list))

  Assert.deepEqual(
    fn(list),
    expect
  )

  let gn = () => {
    fn(list)
    //console.log('Res = %j', res)
  }

  let ti = new Date()
  _.times(tests, gn)
  let tf = new Date()
  let dt = (tf - ti) / 1000.0
  console.log('Time = %s seconds', dt)
}

let argv = process.argv.slice(2)
console.log(argv)

_.reduce(argv, (acc, arg) => {
  if (_.isUndefined(acc)) {
    let rules = testRules(arg)
    let fn = tests(arg)

    return {
      fn: fn,
      rules: rules,
      i: 0
    }
  }

  return {
    i: acc.i + 1,
    rules: acc.rules,
    fn: acc.fn(acc.rules[acc.i](arg))
  }
}, undefined)
