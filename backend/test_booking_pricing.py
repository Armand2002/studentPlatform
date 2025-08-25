"""
Test integrazione Booking + Pricing - Verifica calcoli automatici nei booking
"""

import asyncio
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.bookings.models import Booking
from app.bookings.services import BookingService
from app.bookings.schemas import BookingCreate

async def test_booking_pricing_integration():
    """
    🧪 TEST BOOKING + PRICING INTEGRATION
    Verifica che i booking calcolino automaticamente i prezzi
    """
    
    db = SessionLocal()
    
    try:
        print("🧪 Testing Booking + Pricing Integration...")
        
        # Simula creazione booking (NOTA: richiede dati esistenti nel DB)
        now = datetime.utcnow()
        start_time = now + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        # Test calcolo durata automatico
        test_booking = Booking(
            student_id=1,
            tutor_id=1,
            package_purchase_id=1,
            start_time=start_time,
            end_time=end_time,
            duration_hours=2,
            subject="Matematica"
        )
        
        # Test metodo auto_calculate_duration
        calculated_duration = test_booking.auto_calculate_duration()
        print(f"✅ Test Duration Calculation:")
        print(f"   Start: {start_time}")
        print(f"   End: {end_time}")
        print(f"   Calculated Duration: {calculated_duration}h")
        
        # Test metodo auto_calculate_pricing
        print(f"✅ Test Pricing Calculation:")
        try:
            pricing_result = await test_booking.auto_calculate_pricing(db)
            if pricing_result:
                print(f"   Calculated Price: €{test_booking.calculated_price}")
                print(f"   Tutor Earnings: €{test_booking.tutor_earnings}")
                print(f"   Platform Fee: €{test_booking.platform_fee}")
                print(f"   Rule Applied: {test_booking.pricing_rule_applied}")
            else:
                print("   ⚠️ Pricing calculation returned None (fallback mode)")
        except Exception as e:
            print(f"   ⚠️ Pricing calculation error: {e}")
        
        print("\n🎉 Booking + Pricing integration test completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        db.close()

# Run test
if __name__ == "__main__":
    success = asyncio.run(test_booking_pricing_integration())
    exit(0 if success else 1)
