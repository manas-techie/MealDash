import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurant.slice";
import authReducer from "./slices/auth.slice";
import config from "../config/config";

const store = configureStore({
    reducer: {
        restaurants: restaurantReducer,
        auth: authReducer,
    },
    devTools: config.MODE !== "production",
});

export default store;   