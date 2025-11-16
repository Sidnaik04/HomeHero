
# **HomeHero – Web Application API Contract**

_This document defines the API "contract" between the frontend and backend for the HomeHero application. It is the single source of truth for API communication._

---

## **1. Data Models**

### **User**
```json
{
  "id": "UUID",
  "name": "string",
  "email": "string",
  "phone": "string",
  "user_type": "customer | provider",
  "location": "string",
  "created_at": "datetime"
}
```

### **Provider**

```json
{
  "provider_id": "UUID",
  "user_id": "UUID",
  "services": ["string"],
  "pricing": "number",
  "availability": "boolean",
  "rating": "float",
  "documents": ["string"],
  "approved": "boolean"
}
```

### **Booking**

```json
{
  "booking_id": "UUID",
  "customer_id": "UUID",
  "provider_id": "UUID",
  "service_type": "string",
  "status": "pending | accepted | completed | canceled",
  "date_time": "datetime",
  "special_instructions": "string",
  "created_at": "datetime"
}
```

### **Review**

```json
{
  "review_id": "UUID",
  "booking_id": "UUID",
  "customer_id": "UUID",
  "provider_id": "UUID",
  "rating": "float",
  "comment": "string",
  "images": ["string"]
}
```

---

## **2. Authentication Endpoints**

| Feature                | Method | Path                   | Description                                  | Request Body                                                                                                            | Success (200/201)                                             | Error Response                                 |
| ---------------------- | ------ | ---------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| Register User/Provider | POST   | `/api/auth/register`   | Registers a new customer or service provider | `{ "name": "string", "email": "string", "phone": "string", "password": "string", "user_type": "customer \| provider" }` | `{ "message": "Registered successfully", "user_id": "UUID" }` | `{ "error": "Email or phone already exists" }` |
| Login                  | POST   | `/api/auth/login`      | Authenticates user and returns JWT           | `{ "email_or_phone": "string", "password": "string" }`                                                                  | `{ "access_token": "string", "token_type": "Bearer" }`        | `{ "error": "Invalid credentials" }`           |
| Verify OTP             | POST   | `/api/auth/verify-otp` | Verifies OTP for phone authentication        | `{ "phone": "string", "otp": "string" }`                                                                                | `{ "message": "OTP verified" }`                               | `{ "error": "Invalid or expired OTP" }`        |

---

## **3. Customer Endpoints**

| Feature               | Method | Path                                            | Description                              | Request Body                                                                                                     | Success (200)                                                                                           | Error Response                      |
| --------------------- | ------ | ----------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Set Location          | POST   | `/api/user/location`                            | Saves user location                      | `{ "location": "string", "pincode": "string" }`                                                                  | `{ "message": "Location updated" }`                                                                     | `{ "error": "Invalid location" }`   |
| Browse Services       | GET    | `/api/services`                                 | Fetches all available services           | –                                                                                                                | `[ { "name": "Plumber" }, { "name": "Electrician" } ]`                                                  | `{ "error": "No services found" }`  |
| Search Providers      | GET    | `/api/providers?service=string&location=string` | Search providers by service and location | –                                                                                                                | `[ { "provider_id": "UUID", "name": "string", "rating": "float", "location": "string" } ]`              | `{ "error": "No providers found" }` |
| View Provider Profile | GET    | `/api/providers/{provider_id}`                  | Fetch provider details and reviews       | –                                                                                                                | `{ "provider_id": "UUID", "name": "string", "services": ["string"], "rating": "float", "reviews": [] }` | `{ "error": "Provider not found" }` |
| Request Callback      | POST   | `/api/requests/callback`                        | Sends callback request to provider       | `{ "provider_id": "UUID", "preferred_time": "string", "message": "string" }`                                     | `{ "message": "Callback request sent" }`                                                                | `{ "error": "Invalid provider" }`   |
| Book Service          | POST   | `/api/bookings`                                 | Creates new booking                      | `{ "provider_id": "UUID", "service_type": "string", "date_time": "datetime", "special_instructions": "string" }` | `{ "message": "Booking confirmed", "booking_id": "UUID" }`                                              | `{ "error": "Booking failed" }`     |
| Booking Status        | GET    | `/api/bookings/{booking_id}/status`             | Fetch current booking status             | –                                                                                                                | `{ "status": "pending \| accepted \| completed" }`                                                    | `{ "error": "Booking not found" }`  |
| Submit Review         | POST   | `/api/reviews`                                  | Adds review for provider                 | `{ "booking_id": "UUID", "rating": "float", "comment": "string", "images": ["string"] }`                         | `{ "message": "Review submitted" }`                                                                     | `{ "error": "Invalid booking" }`    |

---

## **4. Provider Endpoints**

| Feature                | Method | Path                                          | Description                  | Request Body                                                         | Success (200)                                                                       | Error Response                     |
| ---------------------- | ------ | --------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| Update Profile         | PUT    | `/api/provider/profile`                       | Update provider details      | `{ "name": "string", "services": ["string"], "location": "string" }` | `{ "message": "Profile updated" }`                                                  | `{ "error": "Invalid data" }`      |
| Set Pricing            | PUT    | `/api/provider/pricing`                       | Update service charges       | `{ "pricing": "number" }`                                            | `{ "message": "Pricing updated" }`                                                  | `{ "error": "Invalid pricing" }`   |
| Set Availability       | PUT    | `/api/provider/availability`                  | Toggle availability          | `{ "available": "boolean" }`                                         | `{ "message": "Availability updated" }`                                             | `{ "error": "Invalid status" }`    |
| View Incoming Requests | GET    | `/api/provider/bookings`                      | Get all new booking requests | –                                                                    | `[ { "booking_id": "UUID", "customer_name": "string", "service_type": "string" } ]` | `{ "error": "No requests found" }` |
| Accept/Decline Booking | POST   | `/api/provider/bookings/{booking_id}/respond` | Respond to booking request   | `{ "status": "accepted \| declined" }`                              | `{ "message": "Booking updated" }`                                                  | `{ "error": "Invalid booking" }`   |

---

## **5. Admin Endpoints (Optional)**

| Feature           | Method | Path                                         | Description                  | Request Body | Success (200)                                                            | Error Response                       |
| ----------------- | ------ | -------------------------------------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| Approve Provider  | POST   | `/api/admin/providers/{provider_id}/approve` | Approve provider account     | –            | `{ "message": "Provider approved" }`                                     | `{ "error": "Provider not found" }`  |
| Manage Bookings   | GET    | `/api/admin/bookings`                        | View all bookings            | –            | `[ { "booking_id": "UUID", "status": "string" } ]`                       | `{ "error": "No bookings found" }`   |
| Manage Users      | GET    | `/api/admin/users`                           | View all customers/providers | –            | `[ { "id": "UUID", "name": "string", "role": "customer \| provider" } ]`| `{ "error": "No users found" }`      |
| Review Complaints | GET    | `/api/admin/complaints`                      | View all complaints          | –            | `[ { "complaint_id": "UUID", "description": "string" } ]`                | `{ "error": "No complaints found" }` |
