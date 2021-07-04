import { compareRates } from '../runTickerTask';

describe('compareRates()', () => {
  describe('given the rate does not changed compared to first one and no oscilation from last informed value', () => {
    it('should set difference values to 0 and not inform of an oscilation', () => {
      const result = compareRates(5000, 5000, 0);
      expect(result).toStrictEqual({
        firstRate: 5000,
        currentRate: 5000,
        differenceWithFirst: 0,
        differenceWithLastInformed: 0,
        inform: false,
      });
    });
  });

  describe('given the rate changes 0.01% and last informed difference is 0', () => {
    it('should inform of an oscilation and set difference equal to 0.01%', () => {
      const result = compareRates(1000, 1000.1, 0);
      expect(result).toStrictEqual({
        firstRate: 1000,
        currentRate: 1000.1,
        differenceWithFirst: 0.01,
        differenceWithLastInformed: 0.01,
        inform: true,
      });
    });
  });

  describe('given the rate changes 0.01% and last informed difference was already 0.01%', () => {
    it('should not inform of an oscilation', () => {
      const result = compareRates(1000, 1000.1, 0.01);
      expect(result).toStrictEqual({
        firstRate: 1000,
        currentRate: 1000.1,
        differenceWithFirst: 0.01,
        differenceWithLastInformed: 0,
        inform: false,
      });
    });
  });

  describe('given the rate changes 0.02% and last informed difference was already 0.01%', () => {
    it('should inform of an oscilation', () => {
      const result = compareRates(1000, 1000.2, 0.01);
      expect(result).toStrictEqual({
        firstRate: 1000,
        currentRate: 1000.2,
        differenceWithFirst: 0.02,
        differenceWithLastInformed: 0.01,
        inform: true,
      });
    });
  });
});
