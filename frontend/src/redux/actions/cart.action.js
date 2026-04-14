import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    addFoodItemToCart,
    clearCartItems,
    getCart,
    removeCartItem,
    updateCartItem,
} from "../../utils/mealDashApi";

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            return await getCart();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const addItemToCart = createAsyncThunk(
    "cart/addItemToCart",
    async ({ foodItemId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const cart = await addFoodItemToCart(foodItemId, quantity);
            const totalPrice = (cart?.items || []).reduce(
                (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
                0,
            );

            return {
                cart,
                totalPrice,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const changeCartItemQuantity = createAsyncThunk(
    "cart/changeCartItemQuantity",
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            return await updateCartItem(itemId, quantity);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const deleteCartItem = createAsyncThunk(
    "cart/deleteCartItem",
    async (itemId, { rejectWithValue }) => {
        try {
            return await removeCartItem(itemId);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            return await clearCartItems();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
);
