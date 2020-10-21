const paginate = <T> (sortedItems: T[], page: string, limit: string): T[] => {
  let start = 0;
  let end = sortedItems.length;

  if (limit) {
    end = Number(limit);

    if (page) {
      const pageNo = Number(page);
      start = (pageNo - 1) * end;

      end *= pageNo;
    }

    // end must be <= sortedItems.length
    if (end > sortedItems.length) {
      end = sortedItems.length;
    }
  }

  return sortedItems.slice(start, end);
};

export const pagination = {
  paginate,
};
