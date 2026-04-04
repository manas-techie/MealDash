import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurant.slice";
import config from "../config/config";

const store = configureStore({
    reducer: {
        restaurants: restaurantReducer,
    },
    devTools: config.MODE !== "production",
});

export default store;   