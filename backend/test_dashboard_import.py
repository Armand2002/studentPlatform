#!/usr/bin/env python3
"""
Test per verificare se il dashboard router si importa correttamente
"""

print("🔍 Testing dashboard router import in isolation...")

try:
    print("1. Testing base FastAPI import...")
    from fastapi import FastAPI
    app = FastAPI()
    print("✅ FastAPI OK")
    
    print("2. Testing dashboard router import...")
    from app.dashboard.routes import router as dashboard_router
    print(f"✅ Dashboard router imported: {len(dashboard_router.routes)} routes")
    
    print("3. Testing router inclusion...")
    app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
    print("✅ Router included successfully")
    
    print("4. Checking final routes...")
    dashboard_routes = [route for route in app.routes if hasattr(route, 'path') and '/api/dashboard' in route.path]
    print(f"✅ Dashboard routes in app: {len(dashboard_routes)}")
    for route in dashboard_routes:
        print(f"   - {route.path}")
        
    print("\n🎉 ALL TESTS PASSED! Dashboard router works perfectly!")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
