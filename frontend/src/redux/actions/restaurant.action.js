import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// get all restauurants
export const getRestaurants = createAsyncThunk(
    "restaurants/getRestaurants",
    async (keyword = "", { rejectWithValue }) => {
        try {
            const trimmedKeyword = String(keyword || "").trim();
            const endpoint = trimmedKeyword ? "/restaurants/search" : "/restaurants";

            const { data } = await api.get(endpoint, {
                params: trimmedKeyword ? { keyword: trimmedKeyword } : undefined,
            });

            return {
                totalRestaurants: data.data.totalRestaurants,
                resPerPage: data.data.resPerPage ?? data.data.restaurants.length,
                restaurants: data.data.restaurants,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);
