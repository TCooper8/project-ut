'use strict'

let List = require('../../lib/collections').List
let Assert = require('assert')

describe('List functions', () => {
  it('Should flatten the list', () => {
    let expect = [1,2,3,4,5,6]
    let val = List.flatten([[1,2,3], [4,5], [6]])
    Assert.deepEqual(expect, val)
  })
})
