# 🛒 Amazon Clone 🌟

A full-stack **Amazon Clone** built using **Node.js, Express.js, MongoDB, HTML, and CSS**. This project replicates essential e-commerce functionalities such as product listings, user authentication, cart management, and secure payments. 🚀  

## 📌 Features
- 🛍️ **Browse & search products**  
- 🔐 **User authentication (Signup/Login)**
- 🛒 **Add to cart & checkout system**
- 💳 **Payment gateway integration**
- 📦 **Order management & tracking**
- 🎨 **Responsive UI (Mobile-friendly)**  

## 📸 Screenshots  
![Amazon Clone](./screenshots/amazon-clone-demo.gif)

## 🚀 Tech Stack
- **Backend:** Node.js, Express.js  
- **Frontend:** HTML, CSS  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **Payments:** Stripe API  

## 🛠️ Installation & Setup

### 1️⃣ Prerequisites  
- **Node.js** installed (v14 or later)  
- **MongoDB** installed & running locally or using **MongoDB Atlas**  
- **Stripe API keys** for payment processing  

### 2️⃣ Clone, Install Dependencies & Configure Environment Variables  

```sh
# Clone the Repository
git clone https://github.com/yourusername/amazon-clone.git
cd amazon-clone

# Install Dependencies
npm install

# Create a .env file in the root directory and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Start the Server:
npm start


