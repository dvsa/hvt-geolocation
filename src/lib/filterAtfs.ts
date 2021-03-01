import { utcToZonedTime } from 'date-fns-tz';
import { isValid } from 'date-fns';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

// eslint-disable-next-line max-len
const removeAtfsWithNoGeolocationData = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => items.filter((item) => item.geoLocation
   && item.geoLocation.lat && item.geoLocation.long);

// eslint-disable-next-line max-len
const removeAtfsWithNoAvailability = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => items.filter((item) => item?.availability?.isAvailable !== false
  || !isAvailabilityInformationUpToDate(item?.availability?.endDate));

const isAvailabilityInformationUpToDate = (date: string | undefined): boolean => date
  && isValid(date) && !isDateBeforeToday(date);

// eslint-disable-next-line max-len
const isDateBeforeToday = (date: string): boolean => utcToZonedTime(new Date(date), process.env.TIMEZONE) < utcToZonedTime(new Date(), process.env.TIMEZONE);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
  removeAtfsWithNoGeolocationData,
};
