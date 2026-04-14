import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import {
  Home,
  AllRestaurants,
  RestaurantDetailsPage,
  FoodItemDetailsPage,
  LoginPage,
  SignupPage,
  CartPage,
  OrdersPage,
  OrderSuccessPage,
  SupportPage,
} from "./pages/index.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="/restaurants" element={<AllRestaurants />} />
      <Route
        path="/restaurants/:restaurantId"
        element={<RestaurantDetailsPage />}
      />
      <Route
        path="/restaurants/:restaurantId/food-items/:foodItemId"
        element={<FoodItemDetailsPage />}
      />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
