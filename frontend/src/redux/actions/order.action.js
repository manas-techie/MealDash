import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    cancelMyOrder,
    createStripeCheckoutSession,
    getMyOrders,
} from "../../utils/mealDashApi";

export const fetchMyOrders = createAsyncThunk(
    "order/fetchMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            return await getMyOrders();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const createCheckout = createAsyncThunk(
    "order/createCheckout",
    async (payload, { rejectWithValue }) => {
        try {
            return await createStripeCheckoutSession(payload);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const cancelOrder = createAsyncThunk(
    "order/cancelOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            return await cancelMyOrder(orderId);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);
