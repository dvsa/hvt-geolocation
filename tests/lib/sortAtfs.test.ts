import { sortAtfs } from '../../src/lib/sortAtfs';
import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';
import { GeoLocation } from '../../src/models/geoLocation';

describe('Test sortAtfs', () => {
  test('nearestFirst() returns ATFs in order with correct distances', () => {
    const geoLocation: GeoLocation = <GeoLocation> { lat: 0, long: 0 };
    const unsortedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
      { geoLocation: { lat: 5, long: 5 } },
      { geoLocation: { lat: 3, long: 3 } },
      { geoLocation: { lat: 4, long: 4 } },
      { geoLocation: { lat: 1, long: 1 } },
      { geoLocation: { lat: 2, long: 2 } },
    ];
    const expectedSortedAtfs: AuthorisedTestingFacility[] = <AuthorisedTestingFacility[]>[
      { geoLocation: { lat: 1, long: 1, distance: 97.73 } },
      { geoLocation: { lat: 2, long: 2, distance: 195.45 } },
      { geoLocation: { lat: 3, long: 3, distance: 293.13 } },
      { geoLocation: { lat: 4, long: 4, distance: 390.78 } },
      { geoLocation: { lat: 5, long: 5, distance: 488.36 } },
    ];

    const sortedAtfs: AuthorisedTestingFacility[] = sortAtfs.nearestFirst(geoLocation, unsortedAtfs);

    expect(sortedAtfs).toEqual(expectedSortedAtfs);
  });
});
