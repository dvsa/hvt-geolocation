import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';
import { removeAtfsWithNoAvailability } from '../../src/lib/filterAtfs';

describe('filterAtfs library unit tests', () => {
  describe('removeAtfsWithNoAvailability tests', () => {
    test('ATFs with no information should not be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { availability: { isAvailable: undefined } },
        { availability: { isAvailable: true } },
        { availability: { isAvailable: true } },
      ];
      const result: AuthorisedTestingFacility[] = removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('ATFs with no availability should be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { availability: { isAvailable: false } },
        { availability: { isAvailable: true } },
        { availability: { isAvailable: false } },
      ];
      const result: AuthorisedTestingFacility[] = removeAtfsWithNoAvailability(atfs);
      const expectedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { availability: { isAvailable: true } },
      ];
      expect(result).toEqual(expectedAtfs);
    });

    test('ATFs with availability should not be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { availability: { isAvailable: true } },
        { availability: { isAvailable: true } },
        { availability: { isAvailable: true } },
      ];
      const result: AuthorisedTestingFacility[] = removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('should not throw an exception if an ATF does not have availability data present', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { geoLocation: { lat: 5, long: 5 } },
      ];
      const result: AuthorisedTestingFacility[] = removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });
  });
});