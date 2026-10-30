import { NextResponse } from "next/server";

/**
 * Standardised API response shapes.
 *
 * Every endpoint returns one of these — never a raw object.
 * Consumers can always check `success` before reading `data` or `error`.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Returns a 200 JSON response with { success: true, data }.
 */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Returns an error JSON response with { success: false, error }.
 */
export function err(
  message: string,
  status = 500
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error: message }, { status });
}
