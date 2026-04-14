import { HttpParams } from "@angular/common/http";

/**
 * Processes an object with filters to return http parameters.
 * @param filters Object with params to process.
 * @returns HttpParams obj
 */
export function getHttpParamsByFilters(filters: { [key: string]: any }): HttpParams {
  let params = new HttpParams();
  Object.keys(filters).forEach(key => {
    const value = (filters as any)[key];
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, value);
    }
  });
  return params;
}
