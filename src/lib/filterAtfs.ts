import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';

// eslint-disable-next-line max-len
const removeAtfsWithNoAvailability = (items: AuthorisedTestingFacility[]): AuthorisedTestingFacility[] => items.filter((item) => item?.availability?.isAvailable !== false);

export const filterAtfs = {
  removeAtfsWithNoAvailability,
};
