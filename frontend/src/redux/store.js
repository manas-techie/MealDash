import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurant.slice";
import authReducer from "./slices/auth.slice";
import cartReducer from "./slices/cart.slice";
import orderReducer from "./slices/order.slice";
import config from "../config/config";

const store = configureStore({
    reducer: {
        restaurants: restaurantReducer,
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
    },
    devTools: config.MODE !== "production",
});

export default store;   