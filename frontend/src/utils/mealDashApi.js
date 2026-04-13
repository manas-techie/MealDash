import api from "./api";

export async function getCurrentUser() {
    const response = await api.get("/users/me");
    return response.data?.data?.user || null;
}

export async function loginUser(payload) {
    const response = await api.post("/users/login", payload);
    return response.data?.data?.user || null;
}

export async function signupUser(payload) {
    const response = await api.post("/users/signup", payload);
    return response.data?.data?.user || null;
}

export async function logoutUser() {
    const response = await api.post("/users/logout");
    return response.data?.data || {};
}

export async function getRestaurantDetails(restaurantId) {
    const response = await api.get(`/restaurants/${restaurantId}`);
    return response.data?.data?.restaurant || null;
}

export async function getRestaurantMenus(restaurantId) {
    const response = await api.get(`/restaurants/${restaurantId}/menus`);
    return response.data?.data?.menus || [];
}

export async function getRestaurantFoodItems(restaurantId) {
    const response = await api.get(`/restaurants/${restaurantId}/food-items`);
    return response.data?.data?.foodItems || [];
}

export async function postRestaurantReview(restaurantId, payload) {
    const response = await api.post(`/restaurants/${restaurantId}/reviews`, payload);
    return response.data?.data?.restaurant || null;
}

export async function getFoodItemDetails(restaurantId, foodItemId) {
    const response = await api.get(`/restaurants/${restaurantId}/food-items/${foodItemId}`);
    return response.data?.data?.foodItem || null;
}

export async function postFoodItemReview(restaurantId, foodItemId, payload) {
    const response = await api.post(
        `/restaurants/${restaurantId}/food-items/${foodItemId}/reviews`,
        payload,
    );
    return response.data?.data?.foodItem || null;
}

export async function addFoodItemToCart(foodItemId, quantity = 1) {
    const response = await api.post("/cart", { foodItemId, quantity });
    return response.data?.data?.cart || null;
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}