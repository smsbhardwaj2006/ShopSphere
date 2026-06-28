/* ==========================================================================
   ShopSphere — API Configuration
   NOT currently used by app.js/cart.js/etc — those still use localStorage.
   This file exists so that, when you do wire the frontend to the Django
   backend, there's exactly one place to change the URL (here) instead of
   hunting through every JS file for a hardcoded address.

   To actually connect: replace localStorage calls in js/app.js (Cart, Auth)
   with fetch() calls to `${API_BASE_URL}/api/...` using the endpoints
   listed in the backend's README.md.
   ========================================================================== */

const API_BASE_URL = "http://localhost:8000"; 
// Once deployed, change this to your real Railway backend URL, e.g.:
// const API_BASE_URL = "https://shopsphere-backend.up.railway.app";
