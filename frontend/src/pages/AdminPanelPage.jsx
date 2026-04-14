import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import { Button, Container, Error, Loader } from "../components";
import {
  deleteAdminUser,
  getAdminOrders,
  getAdminUsers,
  getApiErrorMessage,
  getCurrentUser,
  updateAdminUserRole,
  updateOrderStatus,
} from "../utils/mealDashApi";

const ROLE_OPTIONS = ["user", "restaurant-owner", "admin"];
const ORDER_STATUS_OPTIONS = [
  "processing",
  "out for delivery",
  "delivered",
  "cancelled",
];

function AdminPanelPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [userSearch, setUserSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  const [pendingRoleByUserId, setPendingRoleByUserId] = useState({});
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");

  const [pendingStatusByOrderId, setPendingStatusByOrderId] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const loadAdminData = useCallback(async (statusFilter = "") => {
    setError("");

    const [userResult, usersResult, ordersResult] = await Promise.allSettled([
      getCurrentUser(),
      getAdminUsers(),
      getAdminOrders(statusFilter || undefined),
    ]);

    if (userResult.status === "rejected") {
      setError("Please sign in to continue.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (userResult.value?.role !== "admin") {
      setCurrentUser(userResult.value || null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (usersResult.status === "rejected") {
      setError(getApiErrorMessage(usersResult.reason, "Unable to load users."));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (ordersResult.status === "rejected") {
      setError(
        getApiErrorMessage(ordersResult.reason, "Unable to load orders."),
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setCurrentUser(userResult.value || null);
    setUsers(usersResult.value || []);
    setOrders(ordersResult.value?.orders || []);
    setTotalRevenue(ordersResult.value?.totalRevenue || 0);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAdminData(orderStatusFilter);
  }, [loadAdminData, orderStatusFilter]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const haystack = [user.name, user.email, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [users, userSearch]);

  const counts = useMemo(() => {
    return {
      users: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      restaurantOwners: users.filter((user) => user.role === "restaurant-owner")
        .length,
      orders: orders.length,
    };
  }, [users, orders]);

  const handleRefresh = () => {
    setRefreshing(true);
    setNotice("");
    loadAdminData(orderStatusFilter);
  };

  const handlePendingRoleChange = (userId, role) => {
    setPendingRoleByUserId((prev) => ({ ...prev, [userId]: role }));
  };

  const handleRoleUpdate = async (user) => {
    const nextRole = pendingRoleByUserId[user._id] || user.role;
    if (nextRole === user.role) {
      return;
    }

    setUpdatingRoleUserId(user._id);
    setError("");
    setNotice("");

    try {
      const updatedUser = await updateAdminUserRole(user._id, nextRole);
      setUsers((prev) =>
        prev.map((entry) =>
          entry._id === updatedUser._id ? updatedUser : entry,
        ),
      );
      setNotice(`Role updated for ${updatedUser.name}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update role."));
    } finally {
      setUpdatingRoleUserId("");
    }
  };

  const handleDeleteUser = async (user) => {
    setDeletingUserId(user._id);
    setError("");
    setNotice("");

    try {
      await deleteAdminUser(user._id);
      setUsers((prev) => prev.filter((entry) => entry._id !== user._id));
      setNotice(`User ${user.name} deleted successfully.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete user."));
    } finally {
      setDeletingUserId("");
    }
  };

  const handlePendingOrderStatusChange = (orderId, status) => {
    setPendingStatusByOrderId((prev) => ({ ...prev, [orderId]: status }));
  };

  const handleOrderStatusUpdate = async (order) => {
    const nextStatus = pendingStatusByOrderId[order._id] || order.orderStatus;
    if (nextStatus === order.orderStatus) {
      return;
    }

    setUpdatingOrderId(order._id);
    setError("");
    setNotice("");

    try {
      const updatedOrder = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) =>
        prev.map((entry) =>
          entry._id === updatedOrder._id
            ? { ...entry, ...updatedOrder }
            : entry,
        ),
      );
      setNotice(`Order ${order._id.slice(-6)} updated to ${nextStatus}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update order."));
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (loading) {
    return (
      <Container className="py-12 lg:py-16">
        <Loader label="Loading admin panel..." />
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="py-12 lg:py-16">
        <Error
          title="Admin Access Required"
          message="Only admin users can access this page."
          actionTo="/"
          actionLabel="Go to home"
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-8">
        <div className="rounded-4xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                <FiShield /> Admin Control Center
              </span>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Platform operations dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Manage users, review all orders, and control operational status
                from one place.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCcw className="mr-2" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Users
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {counts.users}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Admins
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {counts.admins}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Restaurant Owners
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {counts.restaurantOwners}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Delivered Revenue
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              ₹{totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {notice ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-white">User Management</h2>
              <div className="relative">
                <FiUsers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search users by name, email, role"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white outline-none sm:w-80"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-136 overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const pendingRole = pendingRoleByUserId[user._id] || user.role;
                const roleChanged = pendingRole !== user.role;

                return (
                  <article
                    key={user._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-300">{user.email}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                          Current role: {user.role}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={pendingRole}
                          onChange={(event) =>
                            handlePendingRoleChange(
                              user._id,
                              event.target.value,
                            )
                          }
                          className="h-9 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => handleRoleUpdate(user)}
                          disabled={
                            !roleChanged || updatingRoleUserId === user._id
                          }
                        >
                          {updatingRoleUserId === user._id
                            ? "Saving..."
                            : "Save role"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteUser(user)}
                          disabled={deletingUserId === user._id}
                        >
                          <FiTrash2 className="mr-1" />
                          {deletingUserId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredUsers.length === 0 ? (
                <p className="text-sm text-slate-300">No users found.</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Order Operations</h2>
              <select
                value={orderStatusFilter}
                onChange={(event) => setOrderStatusFilter(event.target.value)}
                className="h-9 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
              >
                <option value="">All statuses</option>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-136 overflow-y-auto pr-1">
              {orders.map((order) => {
                const pendingStatus =
                  pendingStatusByOrderId[order._id] || order.orderStatus;

                return (
                  <article
                    key={order._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-xs text-slate-300">
                          {order.user?.name || "User"} •{" "}
                          {order.restaurant?.name || "Restaurant"}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          Amount: ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                          Current: {order.orderStatus}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <select
                          value={pendingStatus}
                          onChange={(event) =>
                            handlePendingOrderStatusChange(
                              order._id,
                              event.target.value,
                            )
                          }
                          className="h-9 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => handleOrderStatusUpdate(order)}
                          disabled={
                            updatingOrderId === order._id ||
                            pendingStatus === order.orderStatus
                          }
                        >
                          {updatingOrderId === order._id
                            ? "Updating..."
                            : "Update"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {orders.length === 0 ? (
                <p className="text-sm text-slate-300">
                  No orders found for selected filter.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </Container>
  );
}

export default AdminPanelPage;
