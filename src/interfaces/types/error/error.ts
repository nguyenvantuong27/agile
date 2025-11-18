import { ReactNode } from 'react';

export interface ErrorDetail {
  statusCode: number;
  message: string | Record<string, unknown>;
}

export interface ErrorData {
  status: number;
  data: ErrorDetail;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface IError {
  message: string | Record<string, unknown>;
  userId?: string;
}

interface IResponse<T> {
  status: number;
  message: string;
  data: T;
}

export type IErrorResponse = IResponse<IError>;

export function isIErrorResponse(error: unknown): error is IErrorResponse {
  return typeof error === 'object' && error !== null && 'data' in error;
}
