import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';

export const createAtfsSortedDescByLatLong = (limit: number): AuthorisedTestingFacility[] => {
  const atfs: AuthorisedTestingFacility[] = [];

  for (let i = limit; i > 0; i--) {
    atfs.push(<AuthorisedTestingFacility> { geoLocation: { lat: i, long: i } });
  }

  return atfs;
};
