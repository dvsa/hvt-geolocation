export interface PagedResponse<T> {
  Items: T[],
  Count: number,
  ScannedCount: number,
}
