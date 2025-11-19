# HomeHero Dummy Data Generator for Goa, India
# Run this script to populate your database with realistic test data

import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.user import User, UserType
from app.models.provider import Provider
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.service import ServiceCategory
from app.core.security import get_password_hash

SessionLocal = sessionmaker(bind=engine)


def create_dummy_data():
    """Create comprehensive dummy data for HomeHero app"""
    db = SessionLocal()
    
    try:
        print("🏠 Creating HomeHero dummy data for Goa, India...")
        
        # Clear existing data (optional)
        print("🧹 Clearing existing data...")
        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(Provider).delete()
        db.query(User).delete()
        db.query(ServiceCategory).delete()
        db.commit()
        
        # 1. Create Service Categories
        print("🛠️ Creating service categories...")
        service_categories = [
            {
                "name": "plumber",
                "description": "Plumbing services including pipe repair, installation, and maintenance",
                "keywords": ["plumber", "pipe", "water", "leak", "tap", "geyser", "bathroom", "kitchen"]
            },
            {
                "name": "electrician", 
                "description": "Electrical services and repairs for homes and offices",
                "keywords": ["electrician", "wiring", "light", "fan", "power", "electricity", "switch", "repair"]
            },
            {
                "name": "carpenter",
                "description": "Wood work and furniture services",
                "keywords": ["carpenter", "wood", "furniture", "door", "cabinet", "repair", "table", "chair"]
            },
            {
                "name": "painter",
                "description": "House painting and wall decoration services",
                "keywords": ["painter", "paint", "wall", "color", "brush", "interior", "exterior", "decoration"]
            },
            {
                "name": "cleaner",
                "description": "House cleaning and maintenance services",
                "keywords": ["cleaning", "clean", "house", "home", "maid", "sweep", "mop", "sanitize"]
            }
        ]
        
        for category in service_categories:
            service_cat = ServiceCategory(**category)
            db.add(service_cat)
        
        db.commit()
        
        # 2. Create Admin User
        print("👨‍💼 Creating admin user...")
        admin_user = User(
            name="HomeHero",
            email="homehero@gmail.com",
            phone="8600980846",
            hashed_password=get_password_hash("Synape123"),
            user_type=UserType.ADMIN,
            location="Curchorem, Goa",
            pincode="403706",
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        db.commit()
        
        # 3. Create Customer Users
        print("👥 Creating customer users...")
        customers_data = [
            {
                "name": "Raj Sharma",
                "email": "raj.sharma@gmail.com",
                "phone": "9876543211",
                "location": "Baga, Goa",
                "pincode": "403516"
            },
            {
                "name": "Priya Fernandes",
                "email": "priya.fernandes@gmail.com", 
                "phone": "9876543212",
                "location": "Calangute, Goa",
                "pincode": "403516"
            },
            {
                "name": "Amit Desai",
                "email": "amit.desai@gmail.com",
                "phone": "9876543213", 
                "location": "Margao, Goa",
                "pincode": "403601"
            },
            {
                "name": "Sunita Kamat",
                "email": "sunita.kamat@gmail.com",
                "phone": "9876543214",
                "location": "Vasco da Gama, Goa", 
                "pincode": "403802"
            },
            {
                "name": "Rohit Naik",
                "email": "rohit.naik@gmail.com",
                "phone": "9876543215",
                "location": "Mapusa, Goa",
                "pincode": "403507"
            }
        ]
        
        customers = []
        for customer_data in customers_data:
            customer = User(
                name=customer_data["name"],
                email=customer_data["email"], 
                phone=customer_data["phone"],
                hashed_password=get_password_hash("CustomerPass123"),
                user_type=UserType.CUSTOMER,
                location=customer_data["location"],
                pincode=customer_data["pincode"],
                is_active=True,
                is_verified=True
            )
            db.add(customer)
            customers.append(customer)
        
        db.commit()
        
        # 4. Create Provider Users & Profiles
        print("🔧 Creating provider users and profiles...")
        providers_data = [
            {
                "name": "Ramesh Plumber",
                "email": "ramesh.plumber@gmail.com",
                "phone": "9123456789",
                "location": "Panaji, Goa", 
                "pincode": "403001",
                "services": ["plumber"],
                "pricing": 500.0,
                "experience_years": 8,
                "service_radius": 20.0
            },
            {
                "name": "Suresh Electrician", 
                "email": "suresh.electric@gmail.com",
                "phone": "9123456788",
                "location": "Margao, Goa",
                "pincode": "403601", 
                "services": ["electrician"],
                "pricing": 600.0,
                "experience_years": 10,
                "service_radius": 25.0
            },
            {
                "name": "Krishna Carpenter",
                "email": "krishna.wood@gmail.com", 
                "phone": "9123456787",
                "location": "Mapusa, Goa",
                "pincode": "403507",
                "services": ["carpenter"],
                "pricing": 800.0,
                "experience_years": 12,
                "service_radius": 30.0
            },
            {
                "name": "Maria Cleaner",
                "email": "maria.clean@gmail.com",
                "phone": "9123456786", 
                "location": "Calangute, Goa",
                "pincode": "403516",
                "services": ["cleaner"],
                "pricing": 300.0,
                "experience_years": 5,
                "service_radius": 15.0
            },
            {
                "name": "Jose Painter",
                "email": "jose.paint@gmail.com",
                "phone": "9123456785",
                "location": "Vasco da Gama, Goa",
                "pincode": "403802",
                "services": ["painter"], 
                "pricing": 700.0,
                "experience_years": 7,
                "service_radius": 18.0
            }
        ]
        
        providers = []
        for provider_data in providers_data:
            # Create provider user
            provider_user = User(
                name=provider_data["name"],
                email=provider_data["email"],
                phone=provider_data["phone"], 
                hashed_password=get_password_hash("ProviderPass123"),
                user_type=UserType.PROVIDER,
                location=provider_data["location"],
                pincode=provider_data["pincode"],
                is_active=True,
                is_verified=True
            )
            db.add(provider_user)
            db.flush()  # Get the ID
            
            # Create provider profile
            provider_profile = Provider(
                user_id=provider_user.id,
                services=provider_data["services"],
                pricing=provider_data["pricing"],
                availability=True,
                rating=round(random.uniform(3.8, 4.9), 1),
                rating_count=random.randint(15, 50),
                approved=True,
                experience_years=provider_data["experience_years"],
                service_radius=provider_data["service_radius"],
                documents=[]  # Portfolio images would go here
            )
            db.add(provider_profile)
            providers.append(provider_profile)
        
        db.commit()
        
        # 5. Create Bookings
        print("📅 Creating bookings...")
        booking_descriptions = [
            "Kitchen sink is leaking badly. Urgent repair needed.",
            "Bedroom fan not working. Wiring issue suspected.", 
            "Need to fix wooden dining table leg.",
            "Weekly house cleaning service required.",
            "Living room walls need fresh paint coating."
        ]
        
        bookings = []
        for i in range(5):
            # Create bookings with different statuses
            statuses = [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.COMPLETED, BookingStatus.COMPLETED, BookingStatus.ACCEPTED]
            
            booking = Booking(
                customer_id=customers[i].id,
                provider_id=providers[i].provider_id,
                service_type=providers[i].services[0],
                status=statuses[i],
                date_time=datetime.now() + timedelta(days=random.randint(1, 10), hours=random.randint(9, 17)),
                special_instructions=booking_descriptions[i],
                estimated_price=providers[i].pricing,
                final_price=providers[i].pricing if statuses[i] == BookingStatus.COMPLETED else None
            )
            db.add(booking)
            bookings.append(booking)
        
        db.commit()
        
        # 6. Create Reviews (only for completed bookings)
        print("⭐ Creating reviews...")
        review_comments = [
            "Excellent service! Very professional and completed the work on time. Highly recommended.",
            "Good work quality. Ramesh was punctual and cleaned up after the job. Will book again.",
            "Amazing carpentry skills. The table looks brand new now. Fair pricing too.",
            "Very thorough cleaning service. Maria pays attention to every detail. Great value for money.", 
            "Outstanding painting work. Jose suggested good color combinations. Very satisfied."
        ]
        
        for i, booking in enumerate(bookings):
            if booking.status == BookingStatus.COMPLETED:
                review = Review(
                    booking_id=booking.booking_id,
                    customer_id=booking.customer_id, 
                    provider_id=booking.provider_id,
                    rating=round(random.uniform(4.0, 5.0), 1),
                    comment=review_comments[i] if i < len(review_comments) else "Great service!",
                    images=[]  # Review images would go here
                )
                db.add(review)
        
        db.commit()
        
        print("✅ Dummy data creation completed successfully!")
        print("\n📊 Created:")
        print(f"   • 1 Admin user")
        print(f"   • 5 Customer users") 
        print(f"   • 5 Provider users with profiles")
        print(f"   • 5 Service categories")
        print(f"   • 5 Bookings with different statuses")
        print(f"   • 3 Reviews for completed services")
        
        print("\n🔐 Login Credentials:")
        print("Admin:")
        print("   Email: admin@homehero.com")
        print("   Password: AdminPass123")
        print("\nCustomers (all use password: CustomerPass123):")
        for customer_data in customers_data:
            print(f"   {customer_data['email']} - {customer_data['name']} ({customer_data['location']})")
        print("\nProviders (all use password: ProviderPass123):")
        for provider_data in providers_data:
            print(f"   {provider_data['email']} - {provider_data['name']} ({provider_data['location']})")
            
        print("\n🌍 Locations in Goa:")
        print("   • Panaji (403001) - Capital city")
        print("   • Margao (403601) - Commercial hub") 
        print("   • Calangute (403516) - Beach area")
        print("   • Mapusa (403507) - Market town")
        print("   • Vasco da Gama (403802) - Port city")
        print("   • Baga (403516) - Tourist area")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating dummy data: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    success = create_dummy_data()
    if success:
        print("\n🎉 Ready for frontend integration!")
        print("Frontend developers can now:")
        print("   • Login with any of the provided credentials")
        print("   • Browse providers in different Goa locations")
        print("   • View existing bookings and reviews")
        print("   • Create new bookings and test the workflow")
    else:
        print("\n💥 Failed to create dummy data. Check the errors above.")