import * as chai from 'chai'

// Chai 5.x+ is ESM and must be dynamically imported in test files.
// This is obnoxious, so we'll just make it global.
globalThis.chai = chai
globalThis.expect = chai.expect
globalThis.Assertion = chai.Assertion
