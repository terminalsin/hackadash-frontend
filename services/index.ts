import { ApiService } from "./api";
import { MockApiService } from "./mockApi";
import { apiService as realApiService } from "./realApi";

// Determine which API service to use based on environment
// Set USE_REAL_API to true to use the new file-based API endpoints
const USE_REAL_API = true; // Change to false to use mock API

export const apiService: ApiService = USE_REAL_API
    ? realApiService
    : new MockApiService();

export * from "./api";
export * from "./mockApi";
export * from "./realApi";
