import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';
import { GeoLocation } from '../models/geoLocation';

/**
 * Haversine formula:
 * a = sin²(Δφ/2) + cos(φ1) ⋅ cos(φ2) ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 * where:
 * φ is latitude in radians,
 * λ is longitude in radians,
 * Δφ is difference between latitudes in radians,
 * Δλ is difference between longitude in radians,
 * R is earth’s radius in meters
 */
const nearestFirst = (geoLocation: GeoLocation, items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => {
  const radius = 6371000; // r
  const lat1 = geoLocation.lat * (Math.PI / 180); // φ1

  items.forEach((atf) => {
    const lat2 = atf.geoLocation.lat * (Math.PI / 180); // φ2
    const latDiff = (atf.geoLocation.lat - geoLocation.lat) * (Math.PI / 180); // Δφ
    const longDiff = (atf.geoLocation.long - geoLocation.long) * (Math.PI / 180); // Δλ

    const a = (Math.sin(latDiff / 2) * Math.sin(latDiff / 2))
      + (Math.cos(lat1) * Math.cos(lat2) * Math.sin(longDiff / 2) * Math.sin(longDiff / 2));

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = (radius * c); // d

    atf.geoLocation.distance = Number((distance / 1609).toFixed(2)); // d in miles to 2 decimal points
  });

  // eslint-disable-next-line max-len
  items.sort((a: AuthorisedTestingFacility, b: AuthorisedTestingFacility) => a.geoLocation.distance - b.geoLocation.distance);

  return items;
};

export const sortAtfs = {
  nearestFirst,
};
