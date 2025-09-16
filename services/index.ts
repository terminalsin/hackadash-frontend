import { ApiService } from "./api";
import { MockApiService } from "./mockApi";
import { realApiService } from "./realApi";

// Determine which API service to use based on environment
const USE_MOCK_API = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

export const apiService: ApiService = true
    ? new MockApiService()
    : realApiService;

export * from "./api";
export * from "./mockApi";
export * from "./realApi";
