# Stockly Inventory Manager

For simple instructions on opening the app after downloading it, see `INSTALL-README.md`.

A beginner-friendly inventory management app built with plain HTML, CSS, and JavaScript.

## Features

- Add products with a quantity, category, and optional door or vanity details
- Record door sizes from 16 x 80 inches through 38 x 80 inches and choose a solid-core or Frosted Glass door style
- Automatically create all 12 available sizes when adding any door style
- Support separate 1 Panel and 2 Panel Hollow Core door styles
- Group inventory rows into a separate section for every door style
- Delete all inventory at once with a confirmation prompt
- Increase or decrease item quantities directly from the Actions column
- Store vanity sizes from 24 to 72 inches in a dedicated inventory column
- Classify vanities as Solid Wood or MDF
- Display vanity size and style in separate inventory columns
- Group vanity items in their own Vanities section
- Automatically create all 9 vanity sizes when adding Solid Wood or MDF vanities
- Edit and delete existing products
- Search products by name or category
- View the total number of products
- See a low-stock warning when an item's quantity is below 5
- Switch between light and dark mode (the choice is remembered)
- Export the inventory to a CSV spreadsheet file
- Automatically save inventory in the browser with `localStorage`
- Responsive layout for desktop and mobile screens
- Elegant showroom background featuring vanities and interior doors
- No frameworks, build tools, or installation required

## How to run the app

### Easiest option

Double-click `index.html`. It will open in your default web browser.

### Run with a local server (recommended)

Open a terminal in this folder and run one of these commands:

```bash
python -m http.server 8000
```

If your computer uses `python3`, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

Your inventory is stored only in that browser. Clearing the browser's site data will also clear the saved inventory.

## Files

- `index.html` - the page structure
- `style.css` - the design and mobile layout
- `script.js` - inventory actions, search, and local storage
