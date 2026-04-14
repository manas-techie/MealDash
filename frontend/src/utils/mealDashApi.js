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

export async function createRestaurantMenu(restaurantId, menu = []) {
    const response = await api.post(`/restaurants/${restaurantId}/menus`, { menu });
    return response.data?.data?.menu || null;
}

export async function deleteRestaurantMenu(restaurantId, menuId) {
    const response = await api.delete(`/restaurants/${restaurantId}/menus/${menuId}`);
    return response.data?.data || {};
}

export async function addItemsToRestaurantMenu(
    restaurantId,
    menuId,
    payload,
) {
    const response = await api.post(
        `/restaurants/${restaurantId}/menus/${menuId}/items`,
        payload,
    );
    return response.data?.data?.menu || null;
}

export async function removeItemsFromRestaurantMenu(
    restaurantId,
    menuId,
    payload,
) {
    const response = await api.delete(
        `/restaurants/${restaurantId}/menus/${menuId}/items`,
        { data: payload },
    );
    return response.data?.data?.menu || null;
}

export async function getRestaurantFoodItems(restaurantId) {
    const response = await api.get(`/restaurants/${restaurantId}/food-items`);
    return response.data?.data?.foodItems || [];
}

export async function createRestaurantFoodItem(restaurantId, payload) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }
        formData.append(key, value);
    });

    const response = await api.post(
        `/restaurants/${restaurantId}/food-items`,
        formData,
    );

    return response.data?.data?.foodItem || null;
}

export async function updateRestaurantFoodItem(restaurantId, foodItemId, payload) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }
        formData.append(key, value);
    });

    const response = await api.put(
        `/restaurants/${restaurantId}/food-items/${foodItemId}`,
        formData,
    );

    return response.data?.data?.foodItem || null;
}

export async function generateRestaurantFoodItemDescription(restaurantId, payload) {
    const response = await api.post(
        `/restaurants/${restaurantId}/food-items/generate-description`,
        payload,
    );

    return response.data?.data?.descriptionData || null;
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

export async function getCart() {
    const response = await api.get("/cart");
    return {
        cart: response.data?.data?.cart || null,
        totalPrice: response.data?.data?.totalPrice || 0,
    };
}

export async function updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return {
        cart: response.data?.data?.cart || null,
        totalPrice: response.data?.data?.totalPrice || 0,
    };
}

export async function removeCartItem(itemId) {
    const response = await api.delete(`/cart/${itemId}`);
    return {
        cart: response.data?.data?.cart || null,
        totalPrice: response.data?.data?.totalPrice || 0,
    };
}

export async function clearCartItems() {
    const response = await api.delete("/cart");
    return {
        cart: response.data?.data?.cart || null,
        totalPrice: response.data?.data?.totalPrice || 0,
    };
}

export async function createStripeCheckoutSession(payload) {
    const response = await api.post("/payment/create-checkout-session", payload);
    return response.data?.data || {};
}

export async function getMyOrders() {
    const response = await api.get("/orders/my-orders");
    return response.data?.data?.orders || [];
}

export async function getOrderDetails(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data?.data?.order || null;
}

export async function cancelMyOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data?.data?.order || null;
}

export async function getAdminUsers() {
    const response = await api.get("/admin/users");
    return response.data?.data?.users || [];
}

export async function updateAdminUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data?.data?.user || null;
}

export async function deleteAdminUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data?.data || {};
}

export async function getAdminOrders(status) {
    const response = await api.get("/orders/admin/all", {
        params: status ? { status } : undefined,
    });

    return {
        orders: response.data?.data?.orders || [],
        totalRevenue: Number(response.data?.data?.totalRevenue || 0),
    };
}

export async function updateOrderStatus(orderId, status) {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data?.data?.order || null;
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}