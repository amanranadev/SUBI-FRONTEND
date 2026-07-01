import { API_CONFIG } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { ApiError } from "@/types/auth";
import { Platform } from "react-native";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getGoogleSignInInProgress } from "./oauthState";
import { navigationService } from "./navigationService";
import { queryClient } from "./queryClient";

const API_BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance with default configuration
// Default Content-Type is "application/json" for standard API requests
// For FormData requests, the interceptor will set Content-Type to undefined
// to allow React Native's native HTTP client to set multipart/form-data with boundary
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// CRITICAL: Set transformRequest at instance level to handle FormData correctly
// 
// ROOT CAUSE FIX: Don't replace the entire transformRequest chain - concatenate to it!
// This ensures axios's default serialization logic still runs, which properly handles Content-Type.
// Replacing the entire chain breaks axios's built-in FormData detection in the adapter.
//
// WHY THIS IS NEEDED:
// In React Native, axios's default behavior tries to serialize FormData, which causes
// it to set Content-Type to "application/x-www-form-urlencoded" instead of letting
// the native HTTP client set "multipart/form-data" with the correct boundary.
// By prepending our transformer and returning FormData as-is, we allow React
// Native's underlying fetch/XMLHttpRequest to handle the multipart encoding correctly.
// CRITICAL FIX: For FormData in React Native, we need a different approach
// The issue is that axios's default transformRequest serializes FormData incorrectly
// Solution: Use a minimal transformRequest that only handles FormData, and let React Native's
// native HTTP layer handle the multipart encoding
const formDataTransformer = (data: any, headers?: any) => {
  // Check if data is FormData
  if (data instanceof FormData || (data && typeof data === "object" && "append" in data)) {
    // CRITICAL: EXPLICITLY SET Content-Type to "multipart/form-data" (without boundary)
    // React Native's native HTTP layer will automatically add the boundary parameter
    // Setting it explicitly prevents axios from defaulting to "application/x-www-form-urlencoded"
    if (headers) {
      headers["Content-Type"] = "multipart/form-data";
      // Some layers normalize to lowercase; set both to be safe.
      headers["content-type"] = "multipart/form-data";
      if (headers.common) {
        delete headers.common["Content-Type"];
        delete headers.common["content-type"];
      }
    }
    
    // Return FormData as-is - React Native's adapter should detect it
    return data;
  }
  
  // For non-FormData, use default JSON stringification
  return JSON.stringify(data);
};

// CRITICAL: For FormData, we need to handle it specially
// Our transformer returns FormData as-is and deletes Content-Type header
// For non-FormData, it uses JSON.stringify
// This prevents axios's default transformer from serializing FormData incorrectly
apiClient.defaults.transformRequest = [formDataTransformer];

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // ====================================================================
      // FormData Content-Type Handling (CRITICAL FOR FILE UPLOADS)
      // ====================================================================
      // 
      // PROBLEM:
      // In React Native, axios's default behavior tries to serialize FormData,
      // which causes it to set Content-Type to "application/x-www-form-urlencoded"
      // instead of "multipart/form-data". This causes the server to reject file uploads.
      //
      // SOLUTION:
      // 1. Detect FormData requests (by instance check, append method, or URL pattern)
      // 2. Set Content-Type to undefined (not just delete) to prevent axios serialization
      // 3. Add request-level transformRequest override to return FormData as-is
      // 4. Let React Native's native HTTP client (fetch/XMLHttpRequest) set the
      //    correct "multipart/form-data" header with the proper boundary automatically
      //
      // WHY undefined INSTEAD OF DELETE:
      // Setting to undefined is more explicit and prevents axios from re-adding
      // the header. Simply deleting might allow axios to apply defaults.
      //
      // WHY REQUEST-LEVEL transformRequest:
      // Request-level transformRequest takes precedence over instance-level defaults,
      // providing an additional layer of protection against serialization.
      // ====================================================================
      
      // Check both FormData instance and if data has FormData-like structure
      const isFormData = 
        config.data instanceof FormData ||
        (config.data && typeof config.data === "object" && "append" in config.data) ||
        config.url?.includes("/file/upload"); // Also check URL pattern
      
      console.log("🔍 Request Interceptor - Pre-processing:", {
        url: config.url,
        method: config.method,
        isFormData,
        dataInstance: config.data instanceof FormData ? "FormData" : typeof config.data,
        hasAppend: config.data && typeof config.data === "object" && "append" in config.data,
        urlMatches: config.url?.includes("/file/upload"),
        headersBefore: {
          contentType: config.headers["Content-Type"],
          commonContentType: config.headers.common?.["Content-Type"],
          allHeaders: Object.keys(config.headers),
        },
      });
      
      if (isFormData) {
        // Log FormData contents for debugging
        if (config.data instanceof FormData) {
          try {
            // Try to inspect FormData (note: FormData.entries() might not work in React Native)
            console.log("📋 FormData inspection:", {
              hasData: !!config.data,
              dataType: typeof config.data,
              constructor: config.data.constructor?.name,
            });
          } catch (e) {
            console.log("📋 FormData inspection failed (expected in React Native):", e);
          }
        }
        
        // CRITICAL: EXPLICITLY SET Content-Type to "multipart/form-data" (without boundary)
        // React Native's native HTTP layer will automatically add the boundary parameter
        // Setting it explicitly prevents axios from defaulting to "application/x-www-form-urlencoded"
        // This is the key fix: axios's adapter defaults to URL encoding when Content-Type is missing
        config.headers["Content-Type"] = "multipart/form-data";
        (config.headers as any)["content-type"] = "multipart/form-data";
        
        // Also set in method-specific headers to ensure it's not overridden
        if (config.headers.post) {
          config.headers.post["Content-Type"] = "multipart/form-data";
          (config.headers.post as any)["content-type"] = "multipart/form-data";
        }
        if (config.headers.put) {
          config.headers.put["Content-Type"] = "multipart/form-data";
          (config.headers.put as any)["content-type"] = "multipart/form-data";
        }
        
        // Remove from common headers if they exist (to prevent conflicts)
        if (config.headers.common) {
          delete config.headers.common["Content-Type"];
          delete (config.headers.common as any)["content-type"];
        }
        
        // CRITICAL: For FormData, DISABLE transformRequest entirely
        // Setting transformRequest to undefined/null prevents any transformation
        // React Native's native HTTP layer will handle FormData correctly
        config.transformRequest = undefined;
      }

      const publicEndpoints = [
        "/auth/login",
        "/auth/signup",
        "/auth/password",
        "/auth/google",
        "/auth/oauth_providers",
        "/team_invitations",
        "/ical",
      ];
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      if (!isPublicEndpoint) {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("🔑 Auth token added to request");
        } else {
          console.log("❌ No token available for request:", config.url);
        }
      } else {
        console.log("🌐 Public endpoint, no token needed:", config.url);
      }
      
      // Note: transformRequest is now set at instance level (apiClient.defaults.transformRequest)
      // This ensures FormData is handled correctly for all requests
      // The instance-level transformRequest will be applied automatically
      
      // Log request body for non-FormData requests to debug submission issues
      if (!isFormData && config.data && config.method !== 'get') {
        try {
          const bodyStr = typeof config.data === 'string' 
            ? config.data 
            : JSON.stringify(config.data);
          const bodyPreview = bodyStr.substring(0, 1000);
          console.log("📤 Request body preview:", {
            bodyType: typeof config.data,
            bodyLength: bodyStr.length,
            bodyPreview,
            hasDate: bodyStr.includes('date') || bodyStr.includes('Date'),
            hasAmount: bodyStr.includes('amount') || bodyStr.includes('Amount'),
            hasAddress: bodyStr.includes('address') || bodyStr.includes('Address'),
            hasTransactionCategory: bodyStr.includes('transaction_category') || bodyStr.includes('Transaction'),
            url: config.url,
          });
        } catch (e) {
          console.log("📤 Request body (could not stringify):", { error: String(e), url: config.url });
        }
      }
      
      // Final header check before sending
      console.log("📋 Final request headers:", {
        contentType: config.headers["Content-Type"],
        contentTypeLower: (config.headers as any)["content-type"],
        authorization: config.headers.Authorization ? "Bearer [token]" : "none",
        allHeaders: Object.keys(config.headers),
        isFormData,
        hasTransformRequest: !!config.transformRequest,
        note: isFormData 
          ? "Content-Type removed + transformRequest set to prevent serialization"
          : "Content-Type set normally",
      });
      
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
      _retryDelay?: number;
    };

    
    // Comprehensive error logging
    const errorDetails = {
      method: originalRequest.method?.toUpperCase(),
      url: originalRequest.url,
      fullUrl: `${API_BASE_URL}${originalRequest.url}`,
      baseURL: API_BASE_URL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      isNetworkError: error.code === "ERR_NETWORK",
      isTimeout: error.code === "ECONNABORTED",
      isCanceled: error.code === "ERR_CANCELED",
      requestHeaders: originalRequest.headers,
      responseHeaders: error.response?.headers,
    };
    
    
    console.error(
      `❌ API Error [${errorDetails.method}] ${errorDetails.url}:`,
      errorDetails
    );
    
    // Additional analysis for network errors
    if (errorDetails.isNetworkError) {
      const networkAnalysis = {
        possibleCauses: [
          "Backend server not running or not accessible",
          "Network connectivity issue",
          "CORS configuration blocking request",
          "Incorrect API base URL",
          "Firewall blocking connection",
          "Content-Type header mismatch (server rejecting request)",
        ],
        baseURL: API_BASE_URL,
        isLocalBackend: API_BASE_URL.includes("localhost") || API_BASE_URL.includes("10.0.2.2") || API_BASE_URL.includes("192.168"),
        requestDetails: {
          fullUrl: errorDetails.fullUrl,
          method: errorDetails.method,
          contentType: errorDetails.requestHeaders?.["Content-Type"],
          hasAuth: !!errorDetails.requestHeaders?.Authorization,
        },
        diagnostics: {
          contentTypeIssue: errorDetails.requestHeaders?.["Content-Type"] === "application/x-www-form-urlencoded"
            ? "⚠️ CRITICAL: Content-Type is wrong! Should be multipart/form-data or undefined"
            : "Content-Type looks correct",
          backendReachable: "Check if backend is running: curl " + API_BASE_URL,
          androidEmulator: Platform.OS === "android" 
            ? "Using 10.0.2.2 (Android emulator) - ensure backend is on host machine"
            : "Not Android emulator",
        },
        recommendation: API_BASE_URL.includes("staging") 
          ? "Consider switching to local backend for development"
          : "Verify backend is running and accessible at " + API_BASE_URL,
      };
      
      console.error("🔍 Network Error Analysis:", networkAnalysis);
      
      // Additional check for Content-Type issue
      if (errorDetails.requestHeaders?.["Content-Type"] === "application/x-www-form-urlencoded") {
        console.error("🚨 CRITICAL ISSUE DETECTED:", {
          problem: "Content-Type is set to 'application/x-www-form-urlencoded' instead of 'multipart/form-data'",
          impact: "Server will reject the request or misinterpret the file data",
          solution: "Axios should automatically set multipart/form-data for FormData. This suggests a configuration issue.",
          checkPoints: [
            "Verify FormData is being detected correctly in interceptor",
            "Check if axios is overriding headers after interceptor",
            "Ensure no other code is setting Content-Type",
          ],
        });
      }
    }

    // Check for configuration errors that should not be retried
    const isConfigurationError = 
      errorDetails.requestHeaders?.["Content-Type"] === "application/x-www-form-urlencoded" &&
      (originalRequest.url?.includes("/file/upload") || originalRequest.data instanceof FormData);

    if (isConfigurationError) {
      console.error("🚨 Configuration error detected - skipping retry:", {
        issue: "Content-Type header mismatch",
        message: "This is a configuration issue that retrying will not fix",
        recommendation: "Check axios transformRequest configuration and request interceptor in api.ts",
        troubleshooting: [
          "Check the request interceptor logs in api.ts to ensure Content-Type is being set to undefined",
          "Verify that transformRequest is correctly configured at both instance and request levels",
          "Ensure no other code is setting Content-Type header after the interceptor runs",
          "Check that FormData is being detected correctly in the interceptor (look for 'FormData detected' logs)",
        ],
      });
      
      const apiError: ApiError = {
        message: "Upload failed due to a configuration issue. Please contact support if the problem persists. Check the console logs for detailed troubleshooting steps.",
        status: error.response?.status,
        code: "CONFIGURATION_ERROR",
        errors: undefined,
      };
      
      return Promise.reject(apiError);
    }

    // Retry logic for transient server errors (5xx) with exponential backoff
    // Skip retry for configuration errors, 4xx client errors, and already retried requests
    const shouldRetry = 
      !originalRequest._retry &&
      !isConfigurationError &&
      (error.code === "ERR_NETWORK" || 
       error.code === "ECONNABORTED" ||
       (error.response?.status && error.response.status >= 500 && error.response.status < 600));
    
    const maxRetries = 3;
    const retryCount = originalRequest._retryCount || 0;

    if (shouldRetry && retryCount < maxRetries) {
      originalRequest._retry = true;
      originalRequest._retryCount = retryCount + 1;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      originalRequest._retryDelay = delay;

      console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${maxRetries}) after ${delay}ms:`, {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        code: error.code,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if Google sign-in is in progress - skip logout if so
      if (getGoogleSignInInProgress()) {
        return Promise.reject(error);
      }

      try {
        useAuthStore.getState().clearToken();
        useUserStore.getState().clearUser();
        // Clear React Query cache to prevent showing previous user's data
        queryClient.clear();

        console.log("🔐 Token expired, redirecting to login");

        navigationService.navigateToLogin();
      } catch (storeError) {
        console.error("Error clearing auth state:", storeError);
      }
    }

    const responseData = error.response?.data as any;

    // Handle different error formats from backend
    // Rails typically returns: { errors: ["Email has already been taken"] }
    // Or: { error: "Something went wrong" }
    // Or: { message: "Something went wrong" }
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      (Array.isArray(responseData?.errors) ? responseData.errors.join(", ") : null) ||
      error.message ||
      "An error occurred";

    const apiError: ApiError = {
      message: errorMessage,
      status: error.response?.status,
      code: error.code,
      errors: Array.isArray(responseData?.errors) ? responseData.errors : undefined,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
