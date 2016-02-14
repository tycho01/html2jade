import 'babel-polyfill';
import {expect} from 'chai';
import {Writer} from '../src/writer';

describe.only('Writer', () => {

  let writer;

  beforeEach(() => {
    writer = new Writer();
  });

  describe('options', () => {
    it('should have default values', () => {
      expect(writer.wrapLength).to.equal(80);
      expect(writer.scalate).to.equal(false);
      expect(writer.attrSep).to.equal(', ');
      expect(writer.attrQuote).to.equal("'");
      expect(writer.nonAttrQuote).to.equal('"');
      expect(writer.attrQuoteEscaped).to.equal("\\'");
      expect(writer.noEmptyPipe).to.equal(false);
    });
  });

  describe('breakLine', () => {
    it('should break line', () => {
      expect(writer.breakLine(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Vestibulum lorem quam, mattis id nunc sed, vehicula laoreet enim.'
      )).to.deep.equal(
        ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum lorem quam,',
          'mattis id nunc sed, vehicula laoreet enim.']
      );
    });

    it('should not break line', () => {
      expect(writer.breakLine(null)).to.deep.equal([]);
      expect(writer.breakLine([])).to.deep.equal([]);
      expect(writer.breakLine('Hello')).to.deep.equal(['Hello']);
      expect(writer.breakLine(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      )).to.deep.equal(
        ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.']
      );
    });
  });

});