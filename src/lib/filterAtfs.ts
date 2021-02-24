import { utcToZonedTime } from 'date-fns-tz';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

// eslint-disable-next-line max-len
const removeAtfsWithNoAvailability = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => {
  return items.filter((item) => item?.availability?.isAvailable !== false
        || !isAvailabilityInformationUpToDate(item?.availability?.endDate));
};

const isAvailabilityInformationUpToDate = (date: string | undefined): boolean => date && !isDateBeforeToday(date);

// eslint-disable-next-line max-len
const isDateBeforeToday = (date: string): boolean => utcToZonedTime(new Date(date), process.env.TIMEZONE) < utcToZonedTime(new Date(), process.env.TIMEZONE);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
};
