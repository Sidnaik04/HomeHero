# HomeHero Backend - Production API on Render

## 🌐 API Base URL

https://homehero-synap5e.onrender.com

## 📚 API Documentation

https://homehero-synap5e.onrender.com/docs

## 🔐 Test Credentials

### Customers (Password: CustomerPass123)

- raj.sharma@gmail.com - Raj Sharma (Baga, Goa)
- priya.fernandes@gmail.com - Priya Fernandes (Calangute, Goa)
- amit.desai@gmail.com - Amit Desai (Margao, Goa)
- sunita.kamat@gmail.com - Sunita Kamat (Vasco da Gama, Goa)
- rohit.naik@gmail.com - Rohit Naik (Mapusa, Goa)

### Providers (Password: ProviderPass123)

- ramesh.plumber@gmail.com - Ramesh Plumber (Panaji, Goa)
- suresh.electric@gmail.com - Suresh Electrician (Margao, Goa)
- krishna.wood@gmail.com - Krishna Carpenter (Mapusa, Goa)
- maria.clean@gmail.com - Maria Cleaner (Calangute, Goa)
- jose.paint@gmail.com - Jose Painter (Vasco da Gama, Goa)

### Admin (Password: Shared on WA)

- homeheroappsynape@gmail.com - HomeHero Admin

## 🏠 Sample Data Available

- 5 Customers across different Goa locations
- 5 Providers with different services (plumber, electrician, carpenter, cleaner, painter)
- 5 Service categories
- 5 Bookings with various statuses
- 3 Reviews for completed services

## 📍 Goa Locations Covered

- Panaji (403001) - Capital city
- Margao (403601) - Commercial hub
- Calangute (403516) - Beach area
- Mapusa (403507) - Market town
- Vasco da Gama (403802) - Port city
- Baga (403516) - Tourist area

## 🔑 Authentication

All protected endpoints require JWT token:

<hr>

Get token by calling POST /api/auth/login

## 📱 Key Endpoints for Frontend

- GET /api/services/ - List all services
- GET /api/providers/search?location=Goa - Search providers
- POST /api/auth/login - User authentication
- GET /api/users/me - Get user profile
- POST /api/bookings/ - Create booking
- GET /api/bookings/my-bookings - Get user bookings

## ⚠️ Important Notes

- API is hosted on Render free tier - may spin down after inactivity
- First request after inactivity may take 30-60 seconds to respond
- Database persists data between deployments
- HTTPS only - HTTP requests will fail

<hr>

# 1. Register new user

POST /api/auth/register
{
"name": "Test Frontend",
"email": "test@frontend.com",
"phone": "1111111111",
"password": "TestPass123",
"user_type": "customer"
}

# 2. Login

POST /api/auth/login  
{
"email_or_phone": "test@frontend.com",
"password": "TestPass123"
}

# 3. Search providers

GET /api/providers/search?location=Goa&service=plumber

# 4. Create booking

POST /api/bookings/
{
"provider_id": "provider_uuid_from_search",
"service_type": "plumber",
"date_time": "2024-12-01T10:00:00",
"special_instructions": "Test booking from frontend"
}

<hr>

---

## 📞 **COMMUNICATION WITH FRONTEND TEAM**

### **What to tell them:**

**"Hey Frontend Team! 🎉**

**The HomeHero backend is now LIVE and ready for integration:**

1. **✅ API is deployed** at: `https://your-render-url.onrender.com`
2. **✅ Database is populated** with realistic test data for Goa
3. **✅ All endpoints are working** and documented at `/docs`
4. **✅ Test accounts are ready** - you can login and start testing immediately

**You can start building the frontend right now using:**

- The API documentation at `/docs`
- The updated Postman collection
- Sample credentials provided in the guide above

**The API includes everything we discussed:**

- User authentication with JWT
- Provider search with Goa locations
- Booking system with real data
- Reviews and ratings
- Admin panel functionality

**First steps:**

1. Try the health check endpoint to confirm connectivity
2. Login with raj.sharma@gmail.com / CustomerPass123
3. Search for providers in Goa
4. Start building your components with real API responses

**Any questions or issues? Let me know!**"

---

## 🔧 **IF FRONTEND TEAM FACES ISSUES**

### **Common Problems & Solutions:**

1. **"API is slow on first request"**

   - Normal on Render free tier (cold start)
   - Subsequent requests will be fast

2. **"Getting CORS errors"**

   - Make sure using https:// not http://
   - Check if API URL is correct

3. **"401 Unauthorized errors"**

   - Check if JWT token is included in headers
   - Token format: `Bearer your_token_here`

4. **"Need more test data"**
   - Can create more via admin endpoints
   - Or modify the dummy data script and redeploy

### **Support Process:**

1. **Frontend team tests endpoints** using Postman first
2. **Report any API issues** to you
3. **You debug using Render logs** if needed
4. **Frontend builds UI** with confidence that backend works

---

## 🎯 **SUCCESS METRICS**

**Frontend team should be able to:**

- ✅ Login with provided credentials in < 2 minutes
- ✅ Get provider search results immediately
- ✅ Create bookings and see them in dashboard
- ✅ View realistic Indian data (₹ prices, Indian names, Goa locations)
- ✅ Build complete user flows without backend dependencies

**Your HomeHero API is production-ready for frontend integration! 🚀**
