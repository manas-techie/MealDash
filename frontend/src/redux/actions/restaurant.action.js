import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// get all restauurants
export const getRestaurants = createAsyncThunk("restaurants/getRestaurants", async (keyword = " ", { rejectWithValue }) => {
    try {
        // API call
        const { data } = await api.get("/restaurants", { params: { keyword } });
        console.log(data);
        return {
            totalRestaurants: data.data.totalRestaurants,
            resPerPage: data.data.resPerPage,
            restaurants: data.data.restaurants,
        };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
})
