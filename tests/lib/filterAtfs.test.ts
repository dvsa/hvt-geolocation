import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';
import { filterAtfs } from '../../src/lib/filterAtfs';
import { Logger, logger } from '../../src/util/logger';

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

    test('ATFs with an invalid end date should be removed from the list of ATFs', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false, endDate: 102029222222292e9 } },
        { availability: { isAvailable: false, endDate: '' } },
        { availability: { isAvailable: false, endDate: NaN } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });

    test('ATFs with isAvailable set to false but with no end date should not be removed', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoAvailability(atfs);
      expect(result).toEqual(atfs);
    });
  });

  describe('removeAtfsWithNoGeolocationData', () => {
    const log: Logger = logger.create('apiRequestId', 'correlationId');
    test('ATFs with no geolocation property are removed from the list', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false } },
        { availability: { isAvailable: false } },
        { geoLocation: { lat: 4, long: 2 } },
        { geoLocation: { lat: 2, long: 4 } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoGeolocationData(atfs, log);
      const expectedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { geoLocation: { lat: 4, long: 2 } },
        { geoLocation: { lat: 2, long: 4 } },
      ];
      expect(result).toEqual(expectedAtfs);
    });

    test('ATFs with geolocation and a latitude and longitude are not removed', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { geoLocation: { lat: 4, long: 2 } },
        { geoLocation: { lat: 2, long: 4 } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoGeolocationData(atfs, log);
      expect(result).toEqual(atfs);
    });

    test('ATFs with missing latitude property are removed from the list', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { geoLocation: { long: 5 } },
        { geoLocation: { lat: null, long: 4 } },
        { geoLocation: { lat: undefined, long: 3 } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoGeolocationData(atfs, log);
      expect(result).toEqual([]);
    });

    test('ATFs with missing longitude property are removed from the list', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { geoLocation: { long: 5 } },
        { geoLocation: { lat: null, long: 4 } },
        { geoLocation: { lat: undefined, long: 3 } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoGeolocationData(atfs, log);
      expect(result).toEqual([]);
    });

    test('an empty list is returned if none of the ATFs have a geolocation property', () => {
      const atfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]><unknown>[
        { availability: { isAvailable: false } },
        { availability: { isAvailable: false } },
        { availability: { isAvailable: false } },
        { availability: { isAvailable: false } },
      ];
      const result: AuthorisedTestingFacility[] = filterAtfs.removeAtfsWithNoGeolocationData(atfs, log);
      expect(result).toEqual([]);
    });
  });
});
