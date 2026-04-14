import { createSlice } from "@reduxjs/toolkit";
import { cancelOrder, createCheckout, fetchMyOrders } from "../actions/order.action";

const initialState = {
    orders: [],
    loading: false,
    checkoutLoading: false,
    cancellingOrderId: null,
    checkoutUrl: "",
    error: null,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        },
        resetCheckoutUrl: (state) => {
            state.checkoutUrl = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload || [];
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch orders";
            })
            .addCase(createCheckout.pending, (state) => {
                state.checkoutLoading = true;
                state.error = null;
            })
            .addCase(createCheckout.fulfilled, (state, action) => {
                state.checkoutLoading = false;
                state.checkoutUrl = action.payload?.url || "";
            })
            .addCase(createCheckout.rejected, (state, action) => {
                state.checkoutLoading = false;
                state.error = action.payload?.message || "Checkout failed";
            })
            .addCase(cancelOrder.pending, (state, action) => {
                state.error = null;
                state.cancellingOrderId = action.meta.arg;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.cancellingOrderId = null;
                const updatedOrder = action.payload;
                state.orders = state.orders.map((order) =>
                    order._id === updatedOrder?._id ? updatedOrder : order,
                );
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.cancellingOrderId = null;
                state.error = action.payload?.message || "Failed to cancel order";
            });
    },
});

export const { clearOrderError, resetCheckoutUrl } = orderSlice.actions;

export default orderSlice.reducer;
