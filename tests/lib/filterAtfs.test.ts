import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';
import { filterAtfs } from '../../src/lib/filterAtfs';

describe('filterAtfs library unit tests', () => {
  describe('removeAtfsWithNoAvailability tests', () => {
    const futureEndDate = new Date().setDate(new Date().getDate() + 5);
    test('ATFs with no information should not be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: undefined, endDate: futureEndDate } },
        { availability: { isAvailable: true, endDate: futureEndDate } },
        { availability: { isAvailable: true, endDate: futureEndDate } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('ATFs with no availability should be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false, endDate: futureEndDate } },
        { availability: { isAvailable: true, endDate: futureEndDate } },
        { availability: { isAvailable: false, endDate: futureEndDate } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      const expectedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: true, endDate: futureEndDate } },
      ];
      expect(result).toEqual(expectedAtfs);
    });

    test('ATFs with availability should not be removed from the list returned', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: true, endDate: futureEndDate } },
        { availability: { isAvailable: true, endDate: futureEndDate } },
        { availability: { isAvailable: true, endDate: futureEndDate } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('should not remove the ATF if it does not have availability data present', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
        { geoLocation: { lat: 5, long: 5 } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('ATFs with isAvailable set to false but with an end date in the past should not be removed', () => {
      const yesterday = new Date().setDate(new Date().getDate() - 1);
      const oneHourInMs = 1000 * 60 * 60;
      const dateOneHourAgo = Date.now() - oneHourInMs;

      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false, endDate: yesterday } },
        { availability: { isAvailable: false, endDate: dateOneHourAgo } },
        { availability: { isAvailable: false, endDate: futureEndDate } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      const expectedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false, endDate: yesterday } },
        { availability: { isAvailable: false, endDate: dateOneHourAgo } },
      ];
      expect(result).toEqual(expectedAtfs);
    });

    test('ATFs with isAvailable set to false but with no end date should not be removed', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });
  });
});
