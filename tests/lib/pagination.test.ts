import { pagination } from '../../src/lib/pagination';

describe('Test pagination', () => {
  test('paginate() returns expected items', () => {
    const sortedItems: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const page = '2';
    const limit = '5';

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(['6', '7', '8', '9', '10']);
  });

  test('paginate() returns expected items when page is undefined', () => {
    const sortedItems: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const page = undefined;
    const limit = '5';

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(['1', '2', '3', '4', '5']);
  });
});
