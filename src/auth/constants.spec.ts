import { computeExpiresIn, convertSecondsToTimeUnit } from './constants';

describe('test les jwt constant util', () => {
  it('test les jwt constant util', () => {
    const testCases = ['10s', '5m', '2h', '1d', 'invalid', '30x', '20'];
    const expectedResults = [10000, 300000, 7200000, 86400000, 0, 0, 0];
    testCases.forEach((testCase, index) => {
      let result;

      try {
        result = computeExpiresIn(testCase);
      } catch (error) {
        result = 0;
      }
      expect(result).toBe(expectedResults[index]);
    });
  });
});

// Tests for convertSecondsToTimeUnit function

describe('test convertSecondsToTimeUnit function', () => {
  it('should convert seconds to appropriate time unit string', () => {
    const testCases = [10, 300, 7200, 86400, 604800, 0];
    const expectedResults = ['10s', '5m', '2h', '1d', '1w', '0s'];
    testCases.forEach((testCase, index) => {
      const result = convertSecondsToTimeUnit(testCase);
      expect(result).toBe(expectedResults[index]);
    });
  });
});
