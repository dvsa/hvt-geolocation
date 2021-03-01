import { utcToZonedTime } from 'date-fns-tz';
import { isValid } from 'date-fns';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

// eslint-disable-next-line max-len
const removeAtfsWithNoGeolocationData = (atfs: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => atfs.filter((atf) => {
  if (atf.name === 'ATF1') {
    console.log(`ATF1: ${(atf.geoLocation && atf.geoLocation.lat && atf.geoLocation.long).toString()}`);
  }
  return atf.geoLocation && atf.geoLocation.lat && atf.geoLocation.long;
});

// eslint-disable-next-line max-len
const removeAtfsWithNoAvailability = (atfs: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => atfs.filter((atf) => atf?.availability?.isAvailable !== false
  || !isAvailabilityInformationUpToDate(atf?.availability?.endDate));

const isAvailabilityInformationUpToDate = (date: string | undefined): boolean => date
  && isValid(date) && !isDateBeforeToday(date);

// eslint-disable-next-line max-len
const isDateBeforeToday = (date: string): boolean => utcToZonedTime(new Date(date), process.env.TIMEZONE) < utcToZonedTime(new Date(), process.env.TIMEZONE);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
  removeAtfsWithNoGeolocationData,
};
