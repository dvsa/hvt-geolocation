const paginate = <T> (sortedItems: T[], page: string, limit: string): T[] => {
  if (limit) {
    let start = 0;
    let end = Number(limit);

    if (page) {
      start = (Number(page) - 1) * end;
      end *= Number(page);
    }

    return sortedItems.slice(start, end);
  }

  return sortedItems;
};

export const pagination = {
  paginate,
};
