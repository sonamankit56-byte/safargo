# Replica Recon: Meesho App (Rebranded to SafarGo Shopping)

**Target App:** Meesho (Android & Web Platform)  
**Clone Brand:** SafarGo Shopping (सफ़रगो शॉपिंग - भारत की सबसे किफायती ऑनलाइन शॉपिंग)  
**Primary Platform Target:** Mobile-First Web App + Installable Android APK (Capacitor)  
**Recon Timestamp:** 2026-10-17  
**Clean-Room Protocol:** Recreating UX patterns, e-commerce reseller flows, and UI architecture freshly. Zero proprietary assets or copyrighted code used.

---

## 1. Scope & Core Loop

- **Which App & Platform:** Meesho Mobile App & Web (https://www.meesho.com)
- **Which Slice:** The complete End-to-End Consumer & Reseller Shopping Loop:
  1. Discovery & Infinite Product Feed (Lowest Price Deals, Banner Carousel, Categories)
  2. Search & Filtering with Image/Voice cues
  3. Product Details (Images, Sizes, Price, Reviews, Similar items)
  4. Reselling Margin Calculator ("Selling to customer? Add your cash margin")
  5. Shopping Cart & Bag Management
  6. Multi-Address Checkout (Customer address vs Personal address)
  7. Payment Gateway (COD with online payment discount, UPI, Cards, Netbanking)
  8. Order Placement Animation & Live Order Tracking (Step-by-step dispatch timeline)
  9. Reseller Wallet & Margin Payout Tracking
  10. My Orders & User Profile with Multi-Language Support (हिंदी / English)
- **Target Audience:** Indian value-conscious shoppers, small-town entrepreneurs, and WhatsApp resellers.

---

## 2. Sources

| Source | Details Extracted |
| --- | --- |
| Meesho Web & Mobile UI (meesho.com) | Layout hierarchy, product card spacing, badge styling, color palette |
| Meesho Android App Flows | Bottom navigation bar, category hierarchy, reseller margin modal, order tracker |
| Reseller Community Docs | Commission structure, zero-investment reselling flow, customer dispatch rules |
| Public E-Commerce Standards | Payment gateway transitions, address schemas, pincode delivery estimators |

---

## 3. Screen Inventory

| ID | Screen Name | Route / Path | Purpose & Key Features | States Seen |
| --- | --- | --- | --- | --- |
| **S01** | Home Feed | `/` | Top search bar, category chips, banner carousel, lowest prices deals, 2-column infinite product feed | Loading, Filled, Empty |
| **S02** | Categories Hub | `/categories` | Left vertical tabs (Women, Men, Kids, Home, Electronics) + Right sub-category image cards | Loading, Filled |
| **S03** | SafarGo Mall | `/mall` | Verified brands, premium direct-from-factory catalog with 100% genuine guarantees | Loading, Filled |
| **S04** | Product Details | `/product/:id` | Image slider, deal pricing, original price strikethrough, size selector, customer reviews, seller info, "Add to Cart" & "Buy Now" sticky bar | Loading, Filled, Out of Stock |
| **S05** | Reseller Margin Modal | Modal on `/product/:id` | "Are you selling to a customer?" (Yes/No). Input final price, calculate instant profit margin | Default, Margin Applied, Validation Error |
| **S06** | Shopping Bag / Cart | `/cart` | Item list, quantity selector, size modifier, price breakdown (Product charges, total discount, free shipping), "Continue" CTA | Empty, Filled |
| **S07** | Delivery Address | `/checkout/address` | Saved address cards, "Add New Address" modal with Pincode lookup, city & state auto-fill | Empty, Saved, New Form |
| **S08** | Payment Gateway | `/checkout/payment` | Payment modes: Cash on Delivery (COD), UPI (GPay/PhonePe/Paytm), Cards, Netbanking with instant prepaid discount | Selection, Processing, Error |
| **S09** | Order Confirmed | `/order-success` | Animated celebration checkmark, order ID, delivery estimate, WhatsApp updates toggle, "Continue Shopping" | Success animation |
| **S10** | My Orders | `/orders` | Order history tabs: All, Shipped, Delivered, Cancelled. Order items summary and quick track status | Empty, List, Filtered |
| **S11** | Order Tracking | `/orders/:id/track` | 4-step vertical timeline (Order Placed ➔ Packed ➔ Shipped ➔ Delivered), delivery partner details, invoice download | Active, Out for Delivery, Delivered |
| **S12** | Resell & Earn Desk | `/resell` | Reseller dashboard, total margin earned, bank transfer history, catalog share on WhatsApp button | Active, No Margin, Payout Log |
| **S13** | User Account & Profile | `/account` | User details, quick links to Orders, Wishlist, Bank & UPI details, Language changer, SafarGo Supplier Hub | Logged in, Guest |
| **S14** | Search & Filter Modal | `/search` | Search suggestions, recent searches, price filters, category chips, sorting (Low to High, High to Low, Rating) | Suggestions, Results, No Results |

---

## 4. User Flows

### Flow F01: Core Direct Purchase (Happy Path)
`S01 (Home)` ➔ Click Product ➔ `S04 (Product Details)` ➔ Select Size (e.g. M / L) ➔ Click "Buy Now" ➔ `S06 (Cart)` ➔ Click "Continue" ➔ `S07 (Address)` ➔ Select/Enter Address ➔ `S08 (Payment)` ➔ Select Cash on Delivery / UPI ➔ `S09 (Order Confirmed)`  
*Click count to buy:* 6 clicks.

### Flow F02: Reseller Earning & Customer Order Flow
`S04 (Product Details)` ➔ Click "Resell this Product" ➔ `S05 (Margin Modal)` ➔ Enter Resale Price (e.g. Wholesale ₹299 ➔ Customer Price ₹499 = ₹200 Margin) ➔ `S07 (Enter Customer's Delivery Address)` ➔ `S08 (Payment: COD)` ➔ `S09 (Order Dispatched with SafarGo neutral packaging)` ➔ `S12 (Margin credited to Reseller Bank upon delivery)`.

### Flow F03: Category & Visual Discovery
`S01 (Home)` ➔ Click "Categories" in Bottom Bar ➔ `S02 (Categories)` ➔ Tap "Men Ethnic / T-Shirts" ➔ `S14 (Filtered Catalog)` ➔ Sort by "Price: Low to High" ➔ `S04 (Product Details)`.

### Flow F04: Live Order Tracking & Status
`S13 (Account)` ➔ Click "My Orders" ➔ `S10 (My Orders)` ➔ Click "Track Package" ➔ `S11 (Order Tracking Timeline)`.

---

## 5. UI Components Catalog

1. **Top Bar Header (`MeeshoHeader`):**
   - Left: SafarGo Shopping Logo + Tagline
   - Center: Search box with placeholder animation ("Search by Product, Brand or Category"), Mic icon, Camera icon
   - Right: Wishlist Heart icon with counter badge, Cart Bag icon with counter badge
2. **Category Chips Ribbon (`CategoryScroll`):**
   - Horizontal pill bar with icons: "All", "Women Ethnic", "Western Wear", "Men Fashion", "Kids & Toys", "Home & Kitchen", "Beauty & Health", "Jewellery", "Electronics".
3. **Hero Banner Carousel (`PromoCarousel`):**
   - Auto-rotating high-conversion promo banners ("Mega Blockbuster Sale", "Under ₹99 Store", "Free Delivery on All Orders").
4. **Product Card 2-Column Grid (`ProductCard`):**
   - 1:1 Product Image with quick wishlist bookmark button
   - Product Title (truncated to 2 lines)
   - Price row: Bold Deal Price (₹199), Original Price strikethrough (₹499), Discount badge (60% off)
   - Trust badge: "Free Delivery" green pill
   - Customer Rating: Green rating chip (e.g. `★ 4.2` with review count `1,420 Reviews`)
5. **Fixed Bottom Navigation Bar (`BottomNavBar`):**
   - 5 Persistent Tabs: `Home`, `Categories`, `Mall`, `Orders`, `Account` with active highlight styling.
6. **Reseller Margin Calculator Widget (`MarginWidget`):**
   - Interactive toggle, cash profit projection, and breakdown.
7. **Timeline Tracker (`DeliveryTimeline`):**
   - Green connected dots with status labels and timestamps.

---

## 6. Inferred Data Model

```sql
-- 1. Products Catalog
Product (
  id: string,
  title: string,
  category: string,
  sub_category: string,
  wholesale_price: number,
  original_price: number,
  discount_percent: number,
  rating: number,
  rating_count: number,
  images: string[],
  sizes: string[],
  fabric_or_material: string,
  free_delivery: boolean,
  in_stock: boolean,
  seller_name: string
)

-- 2. Cart & Bag Items
CartItem (
  id: string,
  product_id: string,
  product: Product,
  selected_size: string,
  quantity: number,
  is_resale: boolean,
  customer_price?: number,
  reseller_margin?: number
)

-- 3. Customer Delivery Addresses
Address (
  id: string,
  user_id: string,
  full_name: string,
  mobile: string,
  house_no: string,
  road_street: string,
  pincode: string,
  city: string,
  state: string,
  landmark?: string,
  is_default: boolean
)

-- 4. Customer & Reseller Orders
Order (
  id: string,
  order_code: string,
  user_id: string,
  items: CartItem[],
  total_amount: number,
  payment_method: 'cod' | 'upi' | 'card' | 'netbanking',
  payment_status: 'pending' | 'paid',
  delivery_address: Address,
  tracking_status: 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered',
  delivery_partner: string,
  tracking_id: string,
  estimated_delivery_date: string,
  created_at: string,
  is_reseller_order: boolean,
  reseller_margin_amount?: number,
  margin_payout_status?: 'pending' | 'credited'
)

-- 5. Reseller Earnings & Bank Details
ResellerWallet (
  user_id: string,
  total_margin_earned: number,
  withdrawable_balance: number,
  bank_account_number?: string,
  bank_ifsc?: string,
  upi_id?: string
)
```

---

## 7. What is Rebranded to SafarGo

- **Brand Name:** SafarGo Shopping / SafarGo Mall (सफ़रगो ऑनलाइन शॉपिंग)
- **Primary Color:** High-contrast E-Commerce Theme (Meesho Signature Mulberry / Magenta `#9F2089` accented with SafarGo Trust Blue `#0A2885` and Deal Orange `#FF6500`)
- **Copy & Slogans:** All freshly authored Indian e-commerce microcopy ("सही दाम, बेहतरीन क्वालिटी", "Free Delivery on Every Order", "कैश ऑन डिलीवरी उपलब्ध").
- **Zero Scraping:** Products, images, and catalog generated cleanly using high-fidelity modern e-commerce assets and realistic dummy data.
