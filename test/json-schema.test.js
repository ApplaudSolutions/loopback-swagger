var schemaParser = require('../lib/json-schema');
var spec = require('./pet-expanded.json');
var assert = require('assert');
var expect = require('chai').expect;

describe('json schema convertor', function() {
  it('should handle allOf', function() {
    var models = schemaParser(spec.definitions);
    expect(models).have.property('pet');
    expect(models).have.property('newPet');
    expect(models).have.property('errorModel');
    expect(models.newPet).have.property('base', 'pet');
    expect(models.newPet.properties).have.property('kind');
  });
});