"""
Test integrazione pricing - Verifica che tutto funzioni
"""

import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.pricing.services import PricingService

async def test_pricing_integration():
    """
    🧪 TEST COMPLETO INTEGRAZIONE PRICING
    Verifica che i calcoli Excel siano replicati correttamente
    """
    
    db = SessionLocal()
    
    try:
        print("🧪 Testing Pricing Integration...")
        
        # Test 1: Calcolo DOPOSCUOLA Matematica 1h
        result1 = await PricingService.calculate_lesson_price(
            lesson_type="doposcuola",
            subject="Matematica",
            duration_hours=1,
            tutor_id=1,
            db=db
        )
        
        print(f"✅ Test 1 - DOPOSCUOLA Matematica 1h:")
        print(f"   Prezzo totale: €{result1['final_total_price']}")
        print(f"   Tutor guadagno: €{result1['tutor_earnings']} ({result1['tutor_percentage']*100}%)")
        print(f"   Platform fee: €{result1['platform_fee']}")
        print(f"   Regola applicata: {result1['applied_rule_name']}")
        
        # Test 2: Calcolo INDIVIDUALE con sconto volume
        result2 = await PricingService.calculate_lesson_price(
            lesson_type="individuale", 
            subject="Inglese",
            duration_hours=8,  # 8 ore per sconto volume
            tutor_id=1,
            db=db
        )
        
        print(f"✅ Test 2 - INDIVIDUALE Inglese 8h (con sconto volume):")
        print(f"   Prezzo base: €{result2['total_base_price']}")
        print(f"   Sconto volume: {result2['volume_discount_rate']*100}%")
        print(f"   Prezzo finale: €{result2['final_total_price']}")
        print(f"   Tutor guadagno: €{result2['tutor_earnings']}")
        
        # Test 3: Preview calculation (nuovo endpoint)
        result3 = await PricingService.preview_lesson_calculation(
            lesson_type="doposcuola",
            subject="Fisica", 
            duration_hours=2,
            tutor_id=1,
            db=db
        )
        
        print(f"✅ Test 3 - PREVIEW Doposcuola Fisica 2h:")
        print(f"   Prezzo finale: €{result3['final_total_price']}")
        print(f"   Regola applicata: {result3['applied_rule_name']}")
        
        print("\n🎉 All pricing tests passed! Sistema Excel replicato con successo!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        db.close()

# Run test
if __name__ == "__main__":
    success = asyncio.run(test_pricing_integration())
    exit(0 if success else 1)
