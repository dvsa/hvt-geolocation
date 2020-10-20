import { Address } from './address';
import { Availability } from './availability';
import { GeoLocation } from './geoLocation';

export interface AuthorisedTestingFacility {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: Address;
  geoLocation: GeoLocation;
  availability: Availability;
  inclusions: string[];
  exclusions: string[];
  restrictions: string[];
}
