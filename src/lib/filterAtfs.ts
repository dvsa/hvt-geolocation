import { utcToZonedTime } from 'date-fns-tz';
import { isValid, parseISO } from 'date-fns';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';
import { Logger } from '../util/logger';

const removeAtfsWithNoGeolocationData = (atfs: AuthorisedTestingFacility[], logger: Logger): AuthorisedTestingFacility[] => atfs.filter((atf) => {
  if (atf?.geoLocation != null && atf?.geoLocation?.lat != null && atf?.geoLocation?.long != null) {
    return true;
  }
  logger.warn(`ATF removed from results due to an error in geolocation data. ID: ${atf.id}`);
  return false;
});

const removeAtfsWithNoAvailability = (atfs: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => atfs.filter((atf) => atf?.availability?.isAvailable !== false
  || !isAvailabilityInformationUpToDate(parseISO(atf?.availability?.endDate)));

const isAvailabilityInformationUpToDate = (date: Date | undefined): boolean => date
  && isValid(date) && !isDateBeforeToday(date);

const isDateBeforeToday = (date: Date): boolean => utcToZonedTime(new Date(date), process.env.TIMEZONE) < utcToZonedTime(new Date(), process.env.TIMEZONE);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
  removeAtfsWithNoGeolocationData,
};
