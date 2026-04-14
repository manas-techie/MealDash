import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiBookOpen,
  FiPlus,
  FiRefreshCcw,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import { Button, Container, Error, Loader } from "../components";
import {
  addItemsToRestaurantMenu,
  createRestaurantFoodItem,
  createRestaurantMenu,
  deleteRestaurantMenu,
  getApiErrorMessage,
  getCurrentUser,
  getRestaurantDetails,
  getRestaurantFoodItems,
  getRestaurantMenus,
  removeItemsFromRestaurantMenu,
  updateRestaurantFoodItem,
} from "../utils/mealDashApi";

function OwnerMenuStudioPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [foodItems, setFoodItems] = useState([]);

  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [category, setCategory] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [editingFoodItemId, setEditingFoodItemId] = useState("");
  const [foodItemForm, setFoodItemForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    isAvailable: true,
    image: null,
  });

  const isAuthorizedOwner = useMemo(() => {
    if (!restaurant?.owner || !restaurant.currentUser) {
      return false;
    }

    if (restaurant.currentUser.role === "admin") {
      return true;
    }

    return restaurant.owner._id === restaurant.currentUser._id;
  }, [restaurant]);

  const filteredFoodItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) {
      return foodItems;
    }

    return foodItems.filter((item) => {
      const haystack = [item.name, item.category, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [foodItems, itemSearch]);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu._id === selectedMenuId) || null,
    [menus, selectedMenuId],
  );

  const loadMenuStudio = useCallback(async () => {
    setLoading(true);
    setError("");

    const [userResult, restaurantResult, menusResult, foodItemsResult] =
      await Promise.allSettled([
        getCurrentUser(),
        getRestaurantDetails(restaurantId),
        getRestaurantMenus(restaurantId),
        getRestaurantFoodItems(restaurantId),
      ]);

    if (userResult.status === "rejected") {
      navigate("/login");
      return;
    }

    if (restaurantResult.status === "rejected") {
      setError(
        getApiErrorMessage(
          restaurantResult.reason,
          "Unable to load restaurant details.",
        ),
      );
      setLoading(false);
      return;
    }

    const currentUser = userResult.value;
    const nextRestaurant = restaurantResult.value;
    const mergedRestaurant = {
      ...nextRestaurant,
      currentUser,
    };

    const isOwnerOrAdmin =
      currentUser?.role === "admin" ||
      nextRestaurant?.owner?._id === currentUser?._id;

    if (!isOwnerOrAdmin) {
      setError("You are not authorized to manage menus for this restaurant.");
      setLoading(false);
      return;
    }

    const nextMenus =
      menusResult.status === "fulfilled" ? menusResult.value : [];
    const nextFoodItems =
      foodItemsResult.status === "fulfilled" ? foodItemsResult.value : [];

    setRestaurant(mergedRestaurant);
    setMenus(nextMenus);
    setFoodItems(nextFoodItems);

    setSelectedMenuId((prev) => {
      if (prev && nextMenus.some((menu) => menu._id === prev)) {
        return prev;
      }
      return nextMenus[0]?._id || "";
    });

    setLoading(false);
  }, [navigate, restaurantId]);

  useEffect(() => {
    loadMenuStudio();
  }, [loadMenuStudio]);

  const handleCreateMenu = async () => {
    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const createdMenu = await createRestaurantMenu(restaurantId, []);
      const updatedMenus = [...menus, createdMenu];
      setMenus(updatedMenus);
      setSelectedMenuId(createdMenu?._id || "");
      setNotice("Menu created. Add categories and items now.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create menu."));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenuId) {
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      await deleteRestaurantMenu(restaurantId, selectedMenuId);
      const updatedMenus = menus.filter((menu) => menu._id !== selectedMenuId);
      setMenus(updatedMenus);
      setSelectedMenuId(updatedMenus[0]?._id || "");
      setNotice("Menu deleted successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete menu."));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleItem = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const validateEditorInput = () => {
    if (!selectedMenuId) {
      setError("Please select or create a menu first.");
      return false;
    }

    if (!category.trim()) {
      setError("Please enter a category name.");
      return false;
    }

    if (!selectedItemIds.length) {
      setError("Select at least one item to continue.");
      return false;
    }

    return true;
  };

  const syncUpdatedMenu = (updatedMenu) => {
    setMenus((prev) =>
      prev.map((menu) => (menu._id === updatedMenu._id ? updatedMenu : menu)),
    );
  };

  const handleFoodItemFormChange = (field, value) => {
    setFoodItemForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetFoodItemForm = () => {
    setEditingFoodItemId("");
    setFoodItemForm({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      isAvailable: true,
      image: null,
    });
  };

  const handleStartEditFoodItem = (item) => {
    setEditingFoodItemId(item._id);
    setFoodItemForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      price: String(item.price ?? ""),
      stock: String(item.stock ?? ""),
      isAvailable: Boolean(item.isAvailable),
      image: null,
    });
    setNotice("");
    setError("");
  };

  const buildFoodItemPayload = () => ({
    name: foodItemForm.name.trim(),
    description: foodItemForm.description.trim(),
    category: foodItemForm.category.trim(),
    price: foodItemForm.price,
    stock: foodItemForm.stock,
    isAvailable: String(Boolean(foodItemForm.isAvailable)),
    image: foodItemForm.image,
  });

  const validateFoodItemForm = (isCreate) => {
    if (isCreate && !selectedMenuId) {
      setError("Create or select a menu before adding new food items.");
      return false;
    }

    if (!foodItemForm.name.trim()) {
      setError("Food item name is required.");
      return false;
    }

    if (!foodItemForm.description.trim()) {
      setError("Food item description is required.");
      return false;
    }

    if (!foodItemForm.category.trim()) {
      setError("Food item category is required.");
      return false;
    }

    if (foodItemForm.price === "" || Number(foodItemForm.price) < 0) {
      setError("Please provide a valid price.");
      return false;
    }

    if (foodItemForm.stock === "" || Number(foodItemForm.stock) < 0) {
      setError("Please provide a valid stock quantity.");
      return false;
    }

    return true;
  };

  const handleCreateFoodItem = async () => {
    if (!validateFoodItemForm(true)) {
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...buildFoodItemPayload(),
        menuId: selectedMenuId,
      };

      const createdFoodItem = await createRestaurantFoodItem(
        restaurantId,
        payload,
      );

      setFoodItems((prev) => [createdFoodItem, ...prev]);
      setSelectedItemIds((prev) => [
        ...new Set([createdFoodItem._id, ...prev]),
      ]);
      setNotice("New food item created successfully.");
      resetFoodItemForm();
      await loadMenuStudio();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to create new food item."),
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateFoodItem = async () => {
    if (!editingFoodItemId) {
      setError("Select an item to edit first.");
      return;
    }

    if (!validateFoodItemForm(false)) {
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const payload = buildFoodItemPayload();
      const updatedFoodItem = await updateRestaurantFoodItem(
        restaurantId,
        editingFoodItemId,
        payload,
      );

      // Ensure edited items are visible in selected menu/category even for legacy data
      // where menu references may be incomplete.
      if (selectedMenuId && foodItemForm.category.trim()) {
        await addItemsToRestaurantMenu(restaurantId, selectedMenuId, {
          category: foodItemForm.category.trim(),
          items: [editingFoodItemId],
        });
      }

      setFoodItems((prev) =>
        prev.map((item) =>
          item._id === updatedFoodItem._id ? updatedFoodItem : item,
        ),
      );
      setNotice("Food item updated successfully.");
      resetFoodItemForm();
      await loadMenuStudio();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update selected food item.",
        ),
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSingleItemToCategory = async (itemId) => {
    if (!selectedMenuId) {
      setError("Please select a menu first.");
      return;
    }

    if (!category.trim()) {
      setError("Enter a category name before assigning items.");
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const updatedMenu = await addItemsToRestaurantMenu(
        restaurantId,
        selectedMenuId,
        {
          category: category.trim(),
          items: [itemId],
        },
      );
      syncUpdatedMenu(updatedMenu);
      setNotice("Item added to category successfully.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to assign item to category."),
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAddItems = async () => {
    if (!validateEditorInput()) {
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const updatedMenu = await addItemsToRestaurantMenu(
        restaurantId,
        selectedMenuId,
        {
          category: category.trim(),
          items: selectedItemIds,
        },
      );

      syncUpdatedMenu(updatedMenu);
      setNotice("Items added to menu successfully.");
      setSelectedItemIds([]);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to add items."));
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveItems = async () => {
    if (!validateEditorInput()) {
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      const updatedMenu = await removeItemsFromRestaurantMenu(
        restaurantId,
        selectedMenuId,
        {
          category: category.trim(),
          items: selectedItemIds,
        },
      );

      syncUpdatedMenu(updatedMenu);
      setNotice("Items removed from the selected category.");
      setSelectedItemIds([]);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to remove items."));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12 lg:py-16">
        <Loader label="Loading menu studio..." />
      </Container>
    );
  }

  if (error && !restaurant) {
    return (
      <Container className="py-12 lg:py-16">
        <Error
          title="Unable to load menu studio"
          message={error}
          onRetry={loadMenuStudio}
          actionTo={`/restaurants/${restaurantId}`}
          actionLabel="Back to restaurant"
        />
      </Container>
    );
  }

  if (!isAuthorizedOwner) {
    return (
      <Container className="py-12 lg:py-16">
        <Error
          title="Access denied"
          message="Only restaurant owners or admins can access this page."
          actionTo={`/restaurants/${restaurantId}`}
          actionLabel="Back to restaurant"
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-8">
        <div className="rounded-4xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                <FiBookOpen /> Owner Menu Studio
              </span>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                {restaurant?.name}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Create menus, organize categories, and control what customers
                see.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                to={`/restaurants/${restaurantId}`}
                variant="secondary"
                size="md"
              >
                Public restaurant view
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleCreateMenu}
                disabled={processing}
              >
                <FiPlus className="mr-2" /> New menu
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Menus</h2>
              {menus.length ? (
                <button
                  type="button"
                  onClick={loadMenuStudio}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 transition hover:text-white"
                >
                  <FiRefreshCcw /> Refresh
                </button>
              ) : null}
            </div>

            {menus.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/50 p-4 text-sm text-slate-300">
                No menus yet. Create your first menu to start editing categories
                and items.
              </div>
            ) : (
              <div className="space-y-3">
                {menus.map((menu, index) => (
                  <button
                    key={menu._id}
                    type="button"
                    onClick={() => setSelectedMenuId(menu._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedMenuId === menu._id
                        ? "border-cyan-300/40 bg-cyan-400/10"
                        : "border-white/10 bg-slate-950/55 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      Menu {index + 1}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {menu.menu?.length || 0} categories
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedMenu ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleDeleteMenu}
                disabled={processing}
              >
                <FiTrash2 className="mr-2" /> Delete selected menu
              </Button>
            ) : null}
          </aside>

          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">Edit selected menu</h2>
            <p className="text-xs text-slate-300">
              Enter a category name, then add/remove selected items. You can
              also assign a single item directly from the list below.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Category
                </span>
                <input
                  type="text"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="e.g. Starters, Main Course, Beverages"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Search food items
                </span>
                <input
                  type="search"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search by name or category"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Select items
                </h3>
                <span className="text-xs text-slate-300">
                  {selectedItemIds.length} selected
                </span>
              </div>

              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredFoodItems.map((item) => (
                  <label
                    key={item._id}
                    className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/10 bg-slate-950/70 p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item._id)}
                      onChange={() => handleToggleItem(item._id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {item.name}
                      </span>
                      <span className="block text-xs text-slate-300">
                        {item.category} • ${Number(item.price || 0).toFixed(2)}
                      </span>
                    </span>
                  </label>
                ))}

                {filteredFoodItems.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    No items matched your search.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddItems}
                disabled={processing}
              >
                <FiPlus className="mr-2" /> Add to category
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleRemoveItems}
                disabled={processing}
              >
                <FiXCircle className="mr-2" /> Remove from category
              </Button>
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
          </section>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingFoodItemId ? "Edit food item" : "Create food item"}
              </h2>
              {editingFoodItemId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFoodItemForm}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Name
                </span>
                <input
                  type="text"
                  value={foodItemForm.name}
                  onChange={(event) =>
                    handleFoodItemFormChange("name", event.target.value)
                  }
                  placeholder="e.g. Paneer Tikka Bowl"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Description
                </span>
                <textarea
                  rows="3"
                  value={foodItemForm.description}
                  onChange={(event) =>
                    handleFoodItemFormChange("description", event.target.value)
                  }
                  placeholder="Short and appealing item description"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Category
                </span>
                <input
                  type="text"
                  value={foodItemForm.category}
                  onChange={(event) =>
                    handleFoodItemFormChange("category", event.target.value)
                  }
                  placeholder="e.g. Main Course"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Price
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={foodItemForm.price}
                  onChange={(event) =>
                    handleFoodItemFormChange("price", event.target.value)
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Stock
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={foodItemForm.stock}
                  onChange={(event) =>
                    handleFoodItemFormChange("stock", event.target.value)
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Image (optional)
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(event) =>
                    handleFoodItemFormChange(
                      "image",
                      event.target.files?.[0] || null,
                    )
                  }
                  className="block h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </label>

              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={foodItemForm.isAvailable}
                  onChange={(event) =>
                    handleFoodItemFormChange(
                      "isAvailable",
                      event.target.checked,
                    )
                  }
                />
                <span className="text-sm text-slate-200">
                  Mark item as available
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={
                  editingFoodItemId
                    ? handleUpdateFoodItem
                    : handleCreateFoodItem
                }
                disabled={processing}
              >
                {editingFoodItemId ? "Save changes" : "Create food item"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">
              Existing food items
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {foodItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-300">
                        {item.category} • ${Number(item.price || 0).toFixed(2)}{" "}
                        • stock {item.stock}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartEditFoodItem(item)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSingleItemToCategory(item._id)}
                      disabled={processing}
                    >
                      Add to typed category
                    </Button>
                  </div>
                </article>
              ))}

              {foodItems.length === 0 ? (
                <p className="text-sm text-slate-300">
                  No food items available. Create your first one from the form.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {selectedMenu ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">
              Current menu structure
            </h2>
            {selectedMenu.menu?.length ? (
              <div className="mt-4 space-y-3">
                {selectedMenu.menu.map((section) => (
                  <article
                    key={section.category}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">
                        {section.category}
                      </h3>
                      <span className="text-xs text-slate-300">
                        {section.items?.length || 0} items
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {section.items?.map((item) => (
                        <Link
                          key={item._id}
                          to={`/restaurants/${restaurantId}/food-items/${item._id}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-300">
                This menu has no categories yet.
              </p>
            )}
          </section>
        ) : null}
      </section>
    </Container>
  );
}

export default OwnerMenuStudioPage;
