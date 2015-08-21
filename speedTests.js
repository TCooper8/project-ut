'use strict'

let _ = require('lodash')
let List = require('./lib/collections/').List
let Assert = require('assert')

let helpers = {
  averageBy: i => i * i,
  choose: i => i % 3 === 0 ? false : i
}

let listTests = {
  average: list => List.average(list),
  averageBy: List.averageBy(helpers.averageBy),
  choose: List.choose(helpers.choose),
  concat: List.concat,
  flatten: list => List.flatten(list)
}

let lodashTests = {
  average: list => _.sum(list) / list.length,
  averageBy: list => _.sum(_.map(list, helpers.averageBy)) / list.length,
  choose: list => _.filter(list, helpers.choose),
  concat: _.flatten,
  flatten: _.flattenDeep
}

let collections = {
  list: listTests,
  '_': lodashTests
}

let testRules = method => {
  return [ o => o, parseInt, parseInt ]
}

let make = {
  average: _.range,
  averageBy: _.range,
  choose: _.range,
  concat: len => _.map(_.range(len), i => _.range(Math.log10(len))),
  flatten: length => {
    let ls = [1, [2,3], [4, [5, [6]]]]
    return _.map(_.range(length / 6), i => ls)
  }
}

let tests = method => collection => tests => length => {
  let fn = collections[collection][method]
  let list = make[method](length)
  let expect = lodashTests[method](list)

  Assert.deepEqual(
    fn(list),
    expect
  )

  let gn = () => fn(list)
  _.times(tests, gn)
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
