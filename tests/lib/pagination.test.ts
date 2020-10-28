import { pagination } from '../../src/lib/pagination';

describe('Test pagination', () => {
  test('paginate() returns expected items', () => {
    const sortedItems: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const page = '2';
    const limit = '5';

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(['6', '7', '8', '9', '10']);
  });

  test('paginate() returns expected items when not enough items to fill last page', () => {
    const sortedItems: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const page = '2';
    const limit = '5';

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(['6', '7', '8', '9']);
  });

  test('paginate() returns expected items when page is undefined', () => {
    const sortedItems: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const page = undefined;
    const limit = '5';

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(['1', '2', '3', '4', '5']);
  });

  test('paginate() returns all items when limit is undefined', () => {
    const sortedItems: string[] = ['1', '2'];
    const page = '1';
    const limit = undefined;

    const paginatedItems: string[] = pagination.paginate(sortedItems, page, limit);

    expect(paginatedItems).toEqual(sortedItems);
  });
});
