import { createSlice } from "@reduxjs/toolkit";
import {
    addItemToCart,
    changeCartItemQuantity,
    clearCart,
    deleteCartItem,
    fetchCart,
} from "../actions/cart.action";

function getCartCount(cart) {
    if (!cart?.items?.length) {
        return 0;
    }

    return cart.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
    );
}

function normalizeCartPayload(payload) {
    const cart = payload?.cart || null;

    return {
        cart,
        totalPrice: Number(payload?.totalPrice || 0),
        count: getCartCount(cart),
    };
}

const initialState = {
    cart: null,
    totalPrice: 0,
    count: 0,
    loading: false,
    updating: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        resetCartState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                const normalized = normalizeCartPayload(action.payload);
                state.cart = normalized.cart;
                state.totalPrice = normalized.totalPrice;
                state.count = normalized.count;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch cart";
            })
            .addCase(addItemToCart.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(addItemToCart.fulfilled, (state, action) => {
                state.updating = false;
                const normalized = normalizeCartPayload(action.payload);
                state.cart = normalized.cart;
                state.totalPrice = normalized.totalPrice;
                state.count = normalized.count;
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to add item";
            })
            .addCase(changeCartItemQuantity.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(changeCartItemQuantity.fulfilled, (state, action) => {
                state.updating = false;
                const normalized = normalizeCartPayload(action.payload);
                state.cart = normalized.cart;
                state.totalPrice = normalized.totalPrice;
                state.count = normalized.count;
            })
            .addCase(changeCartItemQuantity.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to update item";
            })
            .addCase(deleteCartItem.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(deleteCartItem.fulfilled, (state, action) => {
                state.updating = false;
                const normalized = normalizeCartPayload(action.payload);
                state.cart = normalized.cart;
                state.totalPrice = normalized.totalPrice;
                state.count = normalized.count;
            })
            .addCase(deleteCartItem.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to remove item";
            })
            .addCase(clearCart.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.updating = false;
                state.cart = null;
                state.totalPrice = 0;
                state.count = 0;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to clear cart";
            });
    },
});

export const { clearCartError, resetCartState } = cartSlice.actions;

export default cartSlice.reducer;
