"""
Generate TypeScript constants from OpenAPI schema
"""
import json
import requests
from pathlib import Path
from typing import Dict, Any, List


def fetch_openapi_schema(base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """Fetch OpenAPI schema from FastAPI backend"""
    try:
        response = requests.get(f"{base_url}/openapi.json", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching OpenAPI schema: {e}")
        print("📝 Make sure backend is running on localhost:8000")
        return {}


def extract_enum_values(schema: Dict[str, Any]) -> Dict[str, List[str]]:
    """Extract enum values from OpenAPI schema"""
    enums = {}
    
    # Check components/schemas for enums
    components = schema.get("components", {})
    schemas = components.get("schemas", {})
    
    for name, schema_def in schemas.items():
        if "enum" in schema_def:
            enums[name] = schema_def["enum"]
        
        # Check properties for enums
        properties = schema_def.get("properties", {})
        for prop_name, prop_def in properties.items():
            if "enum" in prop_def:
                enum_name = f"{name}_{prop_name}"
                enums[enum_name] = prop_def["enum"]
    
    return enums


def extract_api_endpoints(schema: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Extract API endpoints from OpenAPI schema"""
    endpoints = {}
    paths = schema.get("paths", {})
    
    for path, methods in paths.items():
        for method, details in methods.items():
            if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                operation_id = details.get("operationId", f"{method}_{path}")
                endpoints[operation_id] = {
                    "method": method.upper(),
                    "path": path,
                    "summary": details.get("summary", ""),
                    "tags": details.get("tags", [])
                }
    
    return endpoints


def generate_typescript_constants(
    enums: Dict[str, List[str]], 
    endpoints: Dict[str, Dict[str, Any]]
) -> str:
    """Generate TypeScript constants file"""
    
    ts_content = """/**
 * Auto-generated TypeScript constants from OpenAPI schema
 * 
 * 🚨 DO NOT EDIT MANUALLY - This file is auto-generated
 * Run `python generate_constants.py` to update
 * 
 * Generated: {timestamp}
 */

""".format(timestamp=__import__("datetime").datetime.now().isoformat())

    # Generate enums
    if enums:
        ts_content += "// 📝 ENUMS FROM BACKEND SCHEMAS\n\n"
        
        for enum_name, values in enums.items():
            ts_content += f"export const {enum_name.upper()} = {{\n"
            for value in values:
                # Convert value to valid TS key
                key = str(value).upper().replace("-", "_").replace(" ", "_")
                ts_content += f"  {key}: '{value}',\n"
            ts_content += "} as const;\n\n"
            
            # Generate type
            ts_content += f"export type {enum_name}Type = typeof {enum_name.upper()}[keyof typeof {enum_name.upper()}];\n\n"
    
    # Generate API endpoints
    if endpoints:
        ts_content += "// 🔗 API ENDPOINTS\n\n"
        ts_content += "export const API_ENDPOINTS = {\n"
        
        # Group by tags
        by_tags: Dict[str, List[tuple]] = {}
        for op_id, details in endpoints.items():
            tag = details["tags"][0] if details["tags"] else "Default"
            if tag not in by_tags:
                by_tags[tag] = []
            by_tags[tag].append((op_id, details))
        
        for tag, tag_endpoints in by_tags.items():
            ts_content += f"  // {tag}\n"
            for op_id, details in tag_endpoints:
                method = details["method"]
                path = details["path"]
                ts_content += f"  {op_id.upper()}: {{ method: '{method}', path: '{path}' }},\n"
            ts_content += "\n"
        
        ts_content += "} as const;\n\n"
        
        # Generate helper function
        ts_content += """// 🛠️ HELPER FUNCTIONS

export function getEndpoint(endpointKey: keyof typeof API_ENDPOINTS, params: Record<string, string | number> = {}) {
  const endpoint = API_ENDPOINTS[endpointKey];
  let path = endpoint.path;
  
  // Replace path parameters
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`{${key}}`, String(value));
  }
  
  return {
    method: endpoint.method,
    path: path
  };
}

export function buildApiUrl(endpointKey: keyof typeof API_ENDPOINTS, params: Record<string, string | number> = {}) {
  const { path } = getEndpoint(endpointKey, params);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${path}`;
}
"""
    
    # Generate status codes
    ts_content += """
// 📊 HTTP STATUS CODES
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusType = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
"""
    
    # Generate common constants
    ts_content += """
// 🎯 COMMON CONSTANTS
export const USER_ROLES = {
  ADMIN: 'admin',
  TUTOR: 'tutor',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];
"""

    return ts_content


def main():
    """Main function"""
    print("🚀 Generating TypeScript constants from OpenAPI schema...")
    
    # Fetch schema
    schema = fetch_openapi_schema()
    if not schema:
        return
    
    # Extract data
    enums = extract_enum_values(schema)
    endpoints = extract_api_endpoints(schema)
    
    print(f"📝 Found {len(enums)} enums")
    print(f"🔗 Found {len(endpoints)} API endpoints")
    
    # Generate TypeScript
    ts_content = generate_typescript_constants(enums, endpoints)
    
    # Write to file
    frontend_path = Path(__file__).parent.parent / "frontend" / "src" / "lib" / "constants.ts"
    frontend_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(frontend_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    
    print(f"✅ Generated constants at: {frontend_path}")
    print("🎯 Import in your components: import { API_ENDPOINTS, USER_ROLES } from '@/lib/constants'")


if __name__ == "__main__":
    main()
