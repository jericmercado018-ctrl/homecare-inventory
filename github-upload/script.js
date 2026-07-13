"use strict";

const STORAGE_KEY = "stocklyInventory";
const THEME_KEY = "stocklyTheme";
const DOOR_SIZES = ["16\" x 80\"", "18\" x 80\"", "20\" x 80\"", "22\" x 80\"", "24\" x 80\"", "26\" x 80\"", "28\" x 80\"", "30\" x 80\"", "32\" x 80\"", "34\" x 80\"", "36\" x 80\"", "38\" x 80\""];
const VANITY_SIZES = ["24\"", "30\"", "36\"", "42\"", "48\"", "54\"", "60\"", "66\"", "72\""];
let inventory = loadInventory();

const elements = {
  addButton: document.querySelector("#addItemButton"),
  emptyAddButton: document.querySelector("#emptyAddButton"),
  body: document.querySelector("#inventoryTableBody"),
  cancelButton: document.querySelector("#cancelButton"),
  category: document.querySelector("#categoryInput"),
  closeButton: document.querySelector("#closeDialogButton"),
  deleteAllButton: document.querySelector("#deleteAllButton"),
  dialog: document.querySelector("#itemDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  doorSize: document.querySelector("#doorSizeInput"),
  doorStyle: document.querySelector("#doorStyleInput"),
  emptyState: document.querySelector("#emptyState"),
  emptyText: document.querySelector("#emptyText"),
  emptyTitle: document.querySelector("#emptyTitle"),
  error: document.querySelector("#formError"),
  exportButton: document.querySelector("#exportButton"),
  form: document.querySelector("#itemForm"),
  id: document.querySelector("#itemId"),
  quantity: document.querySelector("#quantityInput"),
  results: document.querySelector("#resultsText"),
  search: document.querySelector("#searchInput"),
  table: document.querySelector(".table-wrap"),
  themeButton: document.querySelector("#themeButton"),
  themeIcon: document.querySelector("#themeIcon"),
  themeText: document.querySelector("#themeText"),
  toast: document.querySelector("#toast"),
  total: document.querySelector("#totalProducts"),
  vanity: document.querySelector("#vanityInput"),
  vanityStyle: document.querySelector("#vanityStyleInput"),
  vanityBody: document.querySelector("#vanityTableBody"),
  vanityEmptyState: document.querySelector("#vanityEmptyState"),
  vanityResults: document.querySelector("#vanityResultsText"),
  vanityTable: document.querySelector("#vanityTableWrap")
};

function loadInventory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(item =>
      item && typeof item.name === "string" && typeof item.category === "string"
    );
  } catch (error) {
    console.warn("Saved inventory could not be loaded.", error);
    return [];
  }
}

function saveInventory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  } catch (error) {
    showToast("Your browser could not save this change.");
    console.warn("Inventory could not be saved.", error);
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function doorStyleClass(style) {
  const classes = {
    "1 Panel Solid Core": "style-solid-1",
    "2 Panel Solid Core": "style-solid-2",
    "3 Panel Solid Core": "style-solid-3",
    "5 Solid Core": "style-solid-5",
    "1 Panel Hollow Core": "style-hollow-1",
    "2 Panel Hollow Core": "style-hollow-2",
    "Frosted Glass": "style-frosted",
    "1 Panel Frosted Glass": "style-frosted-1",
    "3 Panel Frosted Glass": "style-frosted-3",
    "5 Panel Frosted Glass": "style-frosted-5"
  };
  return classes[style] || "";
}

function inventoryGroup(item) {
  if (item.doorStyle) return item.doorStyle;
  if (item.category === "Vanities" || item.vanity || item.vanityStyle) return "Vanities";
  return "Other Inventory";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  elements.themeIcon.textContent = isDark ? "☀" : "☾";
  elements.themeText.textContent = isDark ? "Light mode" : "Dark mode";
  elements.themeButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function csvValue(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportInventory() {
  if (inventory.length === 0) {
    showToast("Add an item before exporting.");
    return;
  }

  const headings = ["Name", "Quantity", "Category", "Vanity Size", "Vanity Style", "Door Size", "Door Style"];
  const rows = inventory.map(item => [item.name, item.quantity, item.category, item.vanity || "", item.vanityStyle || "", item.doorSize || "", item.doorStyle || ""]);
  const csv = [headings, ...rows].map(row => row.map(csvValue).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stockly-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Inventory exported.");
}

function renderInventory() {
  const searchTerm = elements.search.value.trim().toLowerCase();
  const visibleItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm) ||
    (item.vanity || "").toLowerCase().includes(searchTerm) ||
    (item.vanityStyle || "").toLowerCase().includes(searchTerm) ||
    (item.doorSize || "").toLowerCase().includes(searchTerm) ||
    (item.doorStyle || "").toLowerCase().includes(searchTerm)
  );

  elements.total.textContent = inventory.length;
  elements.results.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? "item" : "items"}`;
  elements.body.replaceChildren();
  elements.vanityBody.replaceChildren();

  const vanityItems = visibleItems.filter(item => inventoryGroup(item) === "Vanities");
  const mainItems = visibleItems.filter(item => inventoryGroup(item) !== "Vanities");
  elements.results.textContent = `${mainItems.length} ${mainItems.length === 1 ? "item" : "items"}`;
  elements.vanityResults.textContent = `${vanityItems.length} ${vanityItems.length === 1 ? "item" : "items"}`;

  const groupOrder = [
    "1 Panel Solid Core",
    "2 Panel Solid Core",
    "3 Panel Solid Core",
    "5 Solid Core",
    "1 Panel Hollow Core",
    "2 Panel Hollow Core",
    "Frosted Glass",
    "1 Panel Frosted Glass",
    "3 Panel Frosted Glass",
    "5 Panel Frosted Glass",
    "Vanities",
    "Other Inventory"
  ];
  const orderedItems = [...visibleItems].sort((a, b) =>
    groupOrder.indexOf(inventoryGroup(a)) - groupOrder.indexOf(inventoryGroup(b))
  );
  const currentGroups = new Map();

  orderedItems.forEach(item => {
    const itemGroup = inventoryGroup(item);
    const targetBody = itemGroup === "Vanities" ? elements.vanityBody : elements.body;
    if (currentGroups.get(targetBody) !== itemGroup) {
      currentGroups.set(targetBody, itemGroup);
      const groupRow = document.createElement("tr");
      groupRow.className = "inventory-group-row";
      const groupHeading = document.createElement("td");
      groupHeading.colSpan = 6;
      groupHeading.textContent = itemGroup;
      groupRow.append(groupHeading);
      targetBody.append(groupRow);
    }

    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.className = "product-name";
    const styleClass = doorStyleClass(item.doorStyle);
    if (styleClass) nameCell.classList.add(styleClass);
    if (item.vanityStyle === "MDF") nameCell.classList.add("style-vanity-mdf");
    if (item.vanityStyle === "Solid Wood") nameCell.classList.add("style-vanity-wood");
    if (!styleClass && !item.vanityStyle) nameCell.classList.add("style-other-product");
    nameCell.textContent = item.name;

    const categoryCell = document.createElement("td");
    const category = document.createElement("span");
    category.className = "category-pill";
    category.textContent = item.category;
    categoryCell.append(category);

    const vanityCell = document.createElement("td");
    vanityCell.className = "vanity-cell";
    vanityCell.textContent = item.vanity || "—";

    const vanityStyleCell = document.createElement("td");
    vanityStyleCell.className = "vanity-cell";
    vanityStyleCell.textContent = item.vanityStyle || "—";

    const quantityCell = document.createElement("td");
    quantityCell.className = "quantity-cell";
    const quantityValue = document.createElement("span");
    quantityValue.textContent = item.quantity;
    quantityCell.append(quantityValue);

    if (item.quantity < 5) {
      const warning = document.createElement("span");
      warning.className = "low-stock-badge";
      warning.textContent = "Low stock";
      quantityCell.append(warning);
    }

    const actionsCell = document.createElement("td");
    actionsCell.className = "actions";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.className = "action-button quantity-action";
    decreaseButton.textContent = "−";
    decreaseButton.disabled = item.quantity === 0;
    decreaseButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    decreaseButton.addEventListener("click", () => changeQuantity(item.id, -1));

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.className = "action-button quantity-action";
    increaseButton.textContent = "+";
    increaseButton.setAttribute("aria-label", `Increase ${item.name} quantity`);
    increaseButton.addEventListener("click", () => changeQuantity(item.id, 1));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit ${item.name}`);
    editButton.addEventListener("click", () => openItemForm(item));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${item.name}`);
    deleteButton.addEventListener("click", () => deleteItem(item.id));

    actionsCell.append(decreaseButton, increaseButton, editButton, deleteButton);
    row.append(nameCell, categoryCell, vanityCell, vanityStyleCell, quantityCell, actionsCell);
    targetBody.append(row);
  });

  const isEmpty = visibleItems.length === 0;
  elements.table.hidden = mainItems.length === 0;
  elements.vanityTable.hidden = vanityItems.length === 0;
  elements.vanityEmptyState.hidden = vanityItems.length > 0;
  elements.emptyState.hidden = !isEmpty;

  if (inventory.length > 0 && isEmpty) {
    elements.emptyTitle.textContent = "No matching items";
    elements.emptyText.textContent = "Try a different name or category.";
    elements.emptyAddButton.hidden = true;
  } else {
    elements.emptyTitle.textContent = "Your inventory is empty";
    elements.emptyText.textContent = "Add your first item to get started.";
    elements.emptyAddButton.hidden = false;
  }
}

function openItemForm(item = null) {
  elements.form.reset();
  elements.error.hidden = true;
  elements.id.value = item?.id ?? "";
  elements.dialogTitle.textContent = item ? "Edit item" : "Add item";
  elements.quantity.value = item?.quantity ?? 1;
  elements.category.value = item?.category ?? "";
  elements.doorSize.value = item?.doorSize ?? "";
  elements.doorStyle.value = item?.doorStyle ?? "";
  elements.vanity.value = item?.vanity ?? "";
  elements.vanityStyle.value = item?.vanityStyle ?? "";
  elements.dialog.showModal();
  elements.category.focus();
}

function closeItemForm() {
  elements.dialog.close();
}

function showFormError(message) {
  elements.error.textContent = message;
  elements.error.hidden = false;
}

function handleSubmit(event) {
  event.preventDefault();

  const category = elements.category.value.trim();
  const quantity = Number(elements.quantity.value);

  if (!category) return showFormError("Please enter a category.");
  if (!Number.isInteger(quantity) || quantity < 0) return showFormError("Quantity must be a whole number of 0 or more.");

  const doorSize = elements.doorSize.value;
  const doorStyle = elements.doorStyle.value;
  const vanity = elements.vanity.value.trim();
  const vanityStyle = elements.vanityStyle.value;
  const name = [doorStyle, doorSize].filter(Boolean).join(" - ") || [vanityStyle, vanity].filter(Boolean).join(" - ") || category;

  const item = {
    id: elements.id.value || createId(),
    name,
    quantity,
    category,
    vanity,
    vanityStyle,
    doorSize,
    doorStyle
  };

  const existingIndex = inventory.findIndex(current => current.id === item.id);
  const addEverySize = existingIndex === -1 && Boolean(doorStyle);
  const addEveryVanitySize = existingIndex === -1 && !doorStyle && Boolean(vanityStyle);

  if (addEverySize) {
    DOOR_SIZES.forEach(size => {
      inventory.push({
        ...item,
        id: createId(),
        name: `${doorStyle} - ${size}`,
        doorSize: size
      });
    });
  } else if (addEveryVanitySize) {
    VANITY_SIZES.forEach(size => {
      inventory.push({
        ...item,
        id: createId(),
        name: `${vanityStyle} Vanity - ${size}`,
        vanity: size
      });
    });
  } else if (existingIndex === -1) {
    inventory.push(item);
  } else {
    inventory[existingIndex] = item;
  }

  saveInventory();
  renderInventory();
  closeItemForm();
  showToast(addEverySize ? "All 12 door sizes added." : addEveryVanitySize ? "All 9 vanity sizes added." : existingIndex === -1 ? "Item added." : "Item updated.");
}

function deleteItem(id) {
  const item = inventory.find(current => current.id === id);
  if (!item || !window.confirm(`Delete "${item.name}"?`)) return;

  inventory = inventory.filter(current => current.id !== id);
  saveInventory();
  renderInventory();
  showToast("Item deleted.");
}

function changeQuantity(id, amount) {
  const item = inventory.find(current => current.id === id);
  if (!item) return;
  item.quantity = Math.max(0, item.quantity + amount);
  saveInventory();
  renderInventory();
}

function deleteAllItems() {
  if (inventory.length === 0) {
    showToast("The inventory is already empty.");
    return;
  }

  if (!window.confirm("Delete all inventory items? This cannot be undone.")) return;
  inventory = [];
  saveInventory();
  renderInventory();
  showToast("All inventory items deleted.");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2500);
}

elements.addButton.addEventListener("click", () => openItemForm());
elements.emptyAddButton.addEventListener("click", () => openItemForm());
elements.cancelButton.addEventListener("click", closeItemForm);
elements.closeButton.addEventListener("click", closeItemForm);
elements.form.addEventListener("submit", handleSubmit);
elements.search.addEventListener("input", renderInventory);
elements.themeButton.addEventListener("click", toggleTheme);
elements.exportButton.addEventListener("click", exportInventory);
elements.deleteAllButton.addEventListener("click", deleteAllItems);
elements.dialog.addEventListener("click", event => {
  if (event.target === elements.dialog) closeItemForm();
});

const savedTheme = localStorage.getItem(THEME_KEY);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
applyTheme(savedTheme || preferredTheme);
renderInventory();
