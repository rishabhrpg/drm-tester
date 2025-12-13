const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

console.log(`Starting Bun Proxy Server...`);

Bun.serve({
  port: process.env.PORT || 8000,
  async fetch(req) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(req.url);

    // Accept requests on /api/drm or root /
    if (url.pathname === "/api/drm" || url.pathname === "/") {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      try {
        let body;
        try {
          body = await req.json();
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        // Validate request body
        if (!body || Object.keys(body).length === 0) {
          console.error("❌ Empty request body");
          return new Response(
            JSON.stringify({
              error: "Bad Request",
              message: "Request body is required",
            }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        // Validate required fields
        const requiredFields = ["contentId", "contentType", "subscriberId"];
        const missingFields = requiredFields.filter((field) => !body[field]);

        if (missingFields.length > 0) {
          console.error("❌ Missing required fields:", missingFields);
          return new Response(
            JSON.stringify({
              error: "Bad Request",
              message: `Missing required fields: ${missingFields.join(", ")}`,
            }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        const drmApiUrl = process.env.DRM_API_URL;
        const authToken = process.env.AUTH_TOKEN;

        if (!authToken || !drmApiUrl) {
          console.error("❌ Environment variables missing");
          return new Response(
            JSON.stringify({
              error: "Server Configuration Error",
              message: "DRM_API_URL or AUTH_TOKEN is not configured.",
            }),
            {
              status: 500,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        // Get user-agent from request, with fallback
        const userAgent =
          req.headers.get("user-agent") ||
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

        console.log("Making request to DRM API...");
        
        const response = await fetch(drmApiUrl, {
          method: "POST",
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,it;q=0.7",
            authorization: `Bearer ${authToken}`,
            "cache-control": "no-cache",
            "content-type": "application/json",
            languagecode: "en",
            origin: "https://watch.evod.co.za",
            platform: "WEB",
            pragma: "no-cache",
            referer: "https://watch.evod.co.za/",
            tenant_identifier: "master",
            "user-agent": userAgent,
          },
          body: JSON.stringify(body),
        });

        console.log("DRM API Response Status:", response.status);

        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           responseData = await response.json();
        } else {
           responseData = await response.text();
           try {
             responseData = JSON.parse(responseData);
           } catch (e) {
             // Keep as text if not JSON
           }
        }

        return new Response(JSON.stringify(responseData), {
          status: response.status,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error("=== DRM Proxy Error ===");
        console.error(error);
        return new Response(
          JSON.stringify({
            error: "Server Error",
            message: error.message || "An unexpected error occurred",
          }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${process.env.PORT || 8000}`);
