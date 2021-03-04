import { utcToZonedTime } from 'date-fns-tz';
import { isValid, parseISO } from 'date-fns';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

// eslint-disable-next-line max-len
const removeAtfsWithNoAvailability = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => items.filter((item) => item?.availability?.isAvailable !== false
        || !isAvailabilityInformationUpToDate(parseISO(item?.availability?.endDate)));

// eslint-disable-next-line max-len
const isAvailabilityInformationUpToDate = (date: Date | undefined): boolean => (date ? isValid(date) && !isDateBeforeToday(date) : false);

// eslint-disable-next-line max-len
const isDateBeforeToday = (date: Date): boolean => utcToZonedTime(new Date(date), process.env.TIMEZONE) < utcToZonedTime(new Date(), process.env.TIMEZONE);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
};
