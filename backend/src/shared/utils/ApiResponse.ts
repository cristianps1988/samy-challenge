export interface SuccessResponse<T = unknown, M = unknown> {
  success: true;
  data?: T;
  meta?: M;
}

export interface ErrorResponse<D = unknown> {
  success: false;
  error: {
    message: string;
    details?: D;
  };
}

export type ApiResponseType<T = unknown, M = unknown, D = unknown> = SuccessResponse<T, M> | ErrorResponse<D>;

export class ApiResponse {
  static success<T = unknown, M = unknown>(data?: T, meta?: M): SuccessResponse<T, M> {
    return {
      success: true,
      data,
      meta,
    };
  }

  static error<D = unknown>(message: string, details?: D): ErrorResponse<D> {
    return {
      success: false,
      error: {
        message,
        details,
      },
    };
  }

  static paginated<T>(data: T[], meta: { page: number; limit: number; total: number; totalPages: number }): SuccessResponse<T[]> {
    return this.success(data, meta);
  }
}
