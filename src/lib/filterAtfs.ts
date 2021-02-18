import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

export const removeAtfsWithNoAvailability = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => {
  return items.filter((item) => item?.availability?.isAvailable !== false);
};
