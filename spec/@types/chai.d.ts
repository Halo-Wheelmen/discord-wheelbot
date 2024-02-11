import type * as chai from 'chai'

// this lets TS know that the `expect` and `Assertion` globals are available
declare global {
  const expect: typeof chai.expect
  const Assertion: typeof chai.Assertion
}
