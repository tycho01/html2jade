import 'babel-polyfill';
import {expect} from 'chai';
import {Output} from '../src/output';

describe('Output', () => {

  let output;

  beforeEach(() => {
    output = new Output();
  });

  describe('enter', () => {
    it('should enter', () => {
      expect(output.enter()).to.deep.equal([' ', '  ']);
    });
  });

  describe('leave', () => {
    it('should leave', () => {
      output.indents = '    ';
      output.leave();
      expect(output.indents).to.equal('  ');
    });
  });

});