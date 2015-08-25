'use strict'

let Assert = require('assert')
let Map = require('../../../lib/collections/mutable/map')

let map = Map().add('name')('bob')

describe('Will test the map functions', () => {
  it('should create an empty map', () => {
    Assert.deepEqual(Map(), { })
  })

  it('should add the correct keys to the map', () => {
    Assert.deepEqual(Map().add('name')('bob'), { name: 'bob' })
    Assert.deepEqual(Map().add(1)(2), { 1: 2 })

    Assert.deepEqual(
      Map()
        .add('name')('bob')
        .add('level')(2), {
      name: 'bob',
      level: 2
    })
  })

  it('should test addPair function', () => {
    Assert.deepEqual(Map().addPair({ key: 'name', value: 'bob' }), { name: 'bob' })
  })

  it('should test containsKey function', () => {
    Assert.equal(Map().add('name')('bob').containsKey('name'), true)
  })

  it('should test count function', () => {
    Assert.equal(Map().add('name')('bob').count(), 1)
  })

  it('should test exists function', () => {
    Assert.equal(map.exists( key => value => {
      return key === 'name' && value === 'bob'
    }), true)
  })

  it('should test the filter function', () => {
    let map = Map()
      .add('name')('bob')
      .add('level')(2)
      .add('age')(2)
      .add('title')('mr')

    Assert.deepEqual(
      map.filter( key => value => {
        return key === 'name' || value === 2
      }), {
        name: 'bob',
        level: 2,
        age: 2
      })
  })

  it('should test fold function', () => {
    Assert.deepEqual(
      Map()
        .add('name')('bob')
        .add('level')(2)
        .add('age')(3)
        .fold( acc => key => value => {
          if (key == 'level' || key == 'age')
            return acc + value
          return acc
        })(11),
      16
    )
  })

  it('should test isEmpty function', () => {
    Assert.equal(Map().add('name')('bob').isEmpty(), false)
    Assert.equal(Map().isEmpty(), true)
  })

  it('should test get function', () => {
    try {
      Map().get('name')
      throw 7
    } catch (err) {
      if (err === 7) {
        throw new Error('Was able to call Map.get on empty map')
      }
    }

    Assert.equal(Map().add('name')('bob').get('name'), 'bob')
  })

  it('should test remove function', () => {
    Assert.deepEqual(Map().add('name')('bob').remove('name'), Map())
  })

  it('should test tryFind function', () => {
    Assert.equal(Map().add('name')('bob').tryFind('name').get(), 'bob')
  })
})
