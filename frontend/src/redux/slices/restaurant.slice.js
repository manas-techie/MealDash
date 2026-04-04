import { createSlice } from "@reduxjs/toolkit";
import { getRestaurants } from "../actions/restaurant.action";

const intialState = {
    restaurants: [],
    totalRestaurants: 0,
    resPerPage: 0,
    loading: false,
    error: null,
    showVegOnly: false,
    pureVegRestaurantsCount: 0,
}

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState: intialState,
    reducers: {
        sortByRating: (state, action) => {
            state.restaurants = state.restaurants.sort((a, b) => b.rating - a.rating);
        },
        sortByReviews: (state, action) => {
            state.restaurants = state.restaurants.sort((a, b) => b.noOfReviews - a.noOfReviews);
        },
        toggleVegOnly: (state) => {
            state.showVegOnly = !state.showVegOnly;
            state.pureVegRestaurantsCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
        },
        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(getRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
                state.totalRestaurants = action.payload.totalRestaurants;
                state.resPerPage = action.payload.resPerPage;
                state.pureVegRestaurantsCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
            })
            .addCase(getRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurants";
            });
    }
})


export const { sortByRating, sortByReviews, toggleVegOnly, clearError } = restaurantSlice.actions;

export default restaurantSlice.reducer;


// Helper function to calculate pure vegetarian restaurant count based on current filter state
const calculatePureVegCount = (restaurants, showVegOnly) => {
    if (showVegOnly) {
        return restaurants.filter((res) => res.isVegetarian).length;
    }
    return restaurants.filter((res) => res.isVegetarian).length;
}