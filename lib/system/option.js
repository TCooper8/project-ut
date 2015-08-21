'use strict';

let Exn = require('./exn.js');
let Util = require('util')

function Option() { }

function None() {
  this.get = () => {
    throw Exn('ArgumentException', 'Cannot call get() from None type.')
  }
}

function Some(val) {
  this.get = () => val
}

Util.inherits(Some, Option)
Util.inherits(None, Option)

// count: 'a option -> number
Some.prototype.count = predicate =>
  predicate(this.get()) ? 1 : 0

None.prototype.count = predicate => 0

// exists: ('a -> bool) -> bool
Some.prototype.exists = predicate =>
  predicate(this.get()) ? true : false

None.prototype.exists = predicate => false

// flatMap: ('a -> 'b option) -> 'b option
Some.prototype.flatMap = mapping =>
  mapping(this.get())

None.prototype.flatMap = mapping => this.identity

// flatten: unit -> 'a option
Some.prototype.flatten = () => {
  let val = this.get()
  if (val instanceof Option) return val.flatten()
  else return this
}

None.prototype.flatten = () => this.identity

// fold: ('State -> 'a -> 'State) -> 'State -> 'State
Some.prototype.fold = folder => {
  let val = this.get()
  return state => folder(state)(val)
}

None.prototype.fold = folder => state => state

// foldBack: ('State -> 'a -> 'State) -> 'State -> 'State
Some.prototype.foldBack = folder => {
  let val = this.get()
  return state => folder(state)(val)
}

None.prototype.foldBack = folder => state => state

// forall: ('a option -> bool) -> bool
Some.prototype.forall = predicate =>
  predicate(this.get())

None.prototype.forall = predicate => false

// getOrElse: (unit -> 'a) -> 'a
Some.prototype.getOrElse = mapping =>
  this.get()

None.prototype.getOrElse = action =>
  action()

// isNone: unit -> bool
Some.prototype.isNone = () => false

None.prototype.isNone = () => true

// isSome: unit -> bool
Some.prototype.isSome = () => true

None.prototype.isSome = () => false

// map: ('a -> 'b) -> 'b option
Some.prototype.map = mapping => {
  let res = mapping(this.get())
  if (res === null || res === undefined) return NoneInstance
  return new Some(res)
}

None.prototype.map = mapping => this.identity

// orElse: (unit -> 'a) -> 'a option
Some.prototype.orElse = action =>
  this

None.prototype.orElse = action => {
  let res = action()
  if (res === null || res === undefined) return NoneInstance
  return new Some(res)
}

// toArray: unit -> 'a array
Some.prototype.toArray = () =>
  [ this.get() ]

None.prototype.toArray = () => []

let NoneInstance = new None()

None.prototype.identity = NoneInstance

Some.prototype.identity = this

module.exports = val =>
  (val === undefined || val === null) ?
    NoneInstance :
    new Some(val)

module.exports.Some = val => new Some(val)
module.exports.None = NoneInstance
