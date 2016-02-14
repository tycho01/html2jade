import 'babel-polyfill';
import {expect} from 'chai';
import {Writer} from '../src/writer';

describe.only('Writer', () => {

  let writer;

  beforeEach(() => {
    writer = new Writer();
  });

  describe('options', () => {
    it("should have default values", () => {
      expect(writer.wrapLength).to.equal(80);
      expect(writer.scalate).to.equal(false);
      expect(writer.attrSep).to.equal(', ');
      expect(writer.attrQuote).to.equal("'");
      expect(writer.nonAttrQuote).to.equal('"');
      expect(writer.attrQuoteEscaped).to.equal("\\'");
      expect(writer.noEmptyPipe).to.equal(false);
    });
  });

});