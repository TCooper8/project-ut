'use strict'

let Assert = require('assert')
let Option = require('../../lib/system/option.js')

describe('Testing option functions', () => {
  it('should bind correctly', () => {
    Assert.equal(Option(5).get(), 5)
    Assert.equal(Option(0).get(), 0)
    Assert.equal(Option(false).get(), false)

    Assert.equal(Option(undefined), Option.None)
    Assert.equal(Option(null), Option.None)
  })

  it('Should count correctly', () => {
    let pred = i => i === 1
    Assert.equal(Option(1).count(pred), 1)
    Assert.equal(Option(undefined).count(pred), 0)

    Assert.equal(Option.None.count(pred), 0)
  })

  it('Should exists correctly', () => {
    let pred = i => i === 1

    Assert.equal(Option(1).exists(pred), true)
    Assert.equal(Option.Some(1).exists(pred), true)

    Assert.equal(Option(undefined).exists(pred), false)
    Assert.equal(Option(null).exists(pred), false)
    Assert.equal(Option.None.exists(pred), false)
  })

  it('Should flatMap correctly', () => {
    let mapping = i => Option(i * i)

    Assert.equal(Option(5).flatMap(mapping).get(), 25)
    Assert.equal(Option.Some(5).flatMap(mapping).get(), 25)

    Assert.equal(Option(undefined).flatMap(mapping), Option.None)
    Assert.equal(Option(null).flatMap(mapping), Option.None)
    Assert.equal(Option.None.flatMap(mapping), Option.None)
  })

  it('Should flatten correctly', () => {
    Assert.equal(Option(5).flatten().get(), 5)
    Assert.equal(Option(Option(5)).flatten().get(), 5)
    Assert.equal(Option(Option(Option(5))).flatten().get(), 5)

    Assert.equal(Option(undefined).flatten(), Option.None)
    Assert.equal(Option(Option(undefined)).flatten(), Option.None)
  })

  it('Should fold correctly', () => {
    Assert.equal(
      Option(5)
        .fold( acc => i => acc * i )(5),
      25
    )
    Assert.equal(
      Option(undefined)
        .fold( acc => i => acc * i)(5),
      5
    )
  })

  it('Should foldBack correctly', () => {
    Assert.equal(
      Option(5)
        .foldBack( acc => i => acc * i )(5),
      25
    )
    Assert.equal(
      Option(undefined)
        .foldBack( acc => i => acc * i)(5),
      5
    )
  })

  it('Should forall correctly', () => {
    Assert.equal(Option(5).forall( i => i === 5 ), true)
    Assert.equal(Option(5).forall( i => i === 6 ), false)

    Assert.equal(Option.None.forall( i => i === 6), false)
  })

  it('Should getOrElse correctly', () => {
    Assert.equal(Option(5).getOrElse( () => 4 ), 5)
    Assert.equal(Option.None.getOrElse( () => 5), 5)
  })

  it('Should isNone or isSome correctly', () => {
    Assert.equal(Option(5).isSome(), true)
    Assert.equal(Option(5).isNone(), false)

    Assert.equal(Option.None.isSome(), false)
    Assert.equal(Option.None.isNone(), true)
  })

  it('Should map correctly', () => {
    Assert.equal(Option(5).map( i => i * i ).get(), 25)
    Assert.equal(Option(5).map( i => undefined), Option.None)
  })

  it('Should orElse correctly', () => {
    Assert.equal(Option(5).orElse( () => 6 ).get(), 5)
    Assert.equal(Option.None.orElse( () => 5).get(), 5)
  })
})
