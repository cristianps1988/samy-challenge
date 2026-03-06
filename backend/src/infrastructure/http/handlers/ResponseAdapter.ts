export class ResponseAdapter {
  static adapt<T>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString() as T;
    }

    if (Array.isArray(data)) {
      return data.map((item) => ResponseAdapter.adapt(item)) as T;
    }

    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = ResponseAdapter.adapt((data as Record<string, unknown>)[key]);
        }
      }
      return result as T;
    }

    return data;
  }
}
