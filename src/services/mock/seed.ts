import type {
  AppNotification,
  Category,
  Product,
  Purchase,
  Sale,
  StockHistory,
  StoreSettings,
  Supplier,
  User,
} from "@/types";
import { generateBarcode, generateQrValue } from "@/utils/id";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const seedUsers: User[] = [
  {
    id: "user_admin",
    fullName: "Ayesha Raza",
    email: "admin@smartmart.com",
    role: "admin",
    status: "active",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastLogin: "2026-07-29T08:12:00Z",
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "user_manager",
    fullName: "Bilal Ahmed",
    email: "manager@smartmart.com",
    role: "manager",
    status: "active",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastLogin: "2026-07-29T07:40:00Z",
    createdAt: "2024-03-22T09:00:00Z",
  },
  {
    id: "user_cashier",
    fullName: "Sana Tariq",
    email: "cashier@smartmart.com",
    role: "cashier",
    status: "active",
    avatar: "https://i.pravatar.cc/150?img=32",
    lastLogin: "2026-07-29T09:02:00Z",
    createdAt: "2024-06-15T09:00:00Z",
  },
  {
    id: "user_cashier2",
    fullName: "Hamza Sheikh",
    email: "hamza@smartmart.com",
    role: "cashier",
    status: "active",
    avatar: "https://i.pravatar.cc/150?img=51",
    lastLogin: "2026-07-28T18:22:00Z",
    createdAt: "2024-08-01T09:00:00Z",
  },
  {
    id: "user_manager2",
    fullName: "Fatima Noor",
    email: "fatima@smartmart.com",
    role: "manager",
    status: "inactive",
    avatar: "https://i.pravatar.cc/150?img=45",
    lastLogin: "2026-06-02T11:00:00Z",
    createdAt: "2024-02-18T09:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const seedCategories: Category[] = [
  { id: "cat_beverages", name: "Beverages", description: "Soft drinks, juices, water, and hot beverages", status: "active", productCount: 0, createdAt: "2024-01-12T09:00:00Z" },
  { id: "cat_snacks", name: "Snacks & Confectionery", description: "Chips, biscuits, chocolates, and candy", status: "active", productCount: 0, createdAt: "2024-01-12T09:00:00Z" },
  { id: "cat_dairy", name: "Dairy & Eggs", description: "Milk, cheese, yoghurt, butter, and eggs", status: "active", productCount: 0, createdAt: "2024-01-12T09:00:00Z" },
  { id: "cat_bakery", name: "Bakery", description: "Bread, cakes, and baked goods", status: "active", productCount: 0, createdAt: "2024-01-14T09:00:00Z" },
  { id: "cat_produce", name: "Fruits & Vegetables", description: "Fresh produce", status: "active", productCount: 0, createdAt: "2024-01-14T09:00:00Z" },
  { id: "cat_meat", name: "Meat & Seafood", description: "Fresh and frozen meat, poultry, and seafood", status: "active", productCount: 0, createdAt: "2024-01-15T09:00:00Z" },
  { id: "cat_household", name: "Household Supplies", description: "Cleaning products and household essentials", status: "active", productCount: 0, createdAt: "2024-01-20T09:00:00Z" },
  { id: "cat_personal", name: "Personal Care", description: "Toiletries, hygiene, and grooming", status: "active", productCount: 0, createdAt: "2024-01-20T09:00:00Z" },
  { id: "cat_frozen", name: "Frozen Foods", description: "Frozen meals and ice cream", status: "active", productCount: 0, createdAt: "2024-02-02T09:00:00Z" },
  { id: "cat_grains", name: "Grains, Rice & Pasta", description: "Staples and pantry grains", status: "active", productCount: 0, createdAt: "2024-02-02T09:00:00Z" },
  { id: "cat_seasonal", name: "Seasonal Items", description: "Limited-time seasonal products", status: "inactive", productCount: 0, createdAt: "2024-05-01T09:00:00Z" },
];

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

export const seedSuppliers: Supplier[] = [
  {
    id: "sup_freshfarm",
    name: "FreshFarm Distributors",
    contactPerson: "Imran Qureshi",
    phone: "+1 (415) 555-0132",
    email: "sales@freshfarmdist.com",
    address: "220 Orchard Way, Fremont, CA",
    status: "active",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-01-05T09:00:00Z",
  },
  {
    id: "sup_goldenvalley",
    name: "Golden Valley Foods",
    contactPerson: "Sara Malik",
    phone: "+1 (312) 555-0198",
    email: "orders@goldenvalleyfoods.com",
    address: "48 Industrial Blvd, Chicago, IL",
    status: "active",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-01-08T09:00:00Z",
  },
  {
    id: "sup_coastal",
    name: "Coastal Seafood Co.",
    contactPerson: "David Chen",
    phone: "+1 (206) 555-0173",
    email: "supply@coastalseafood.com",
    address: "9 Harbor Front, Seattle, WA",
    status: "active",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-02-11T09:00:00Z",
  },
  {
    id: "sup_metrobev",
    name: "Metro Beverage Supply",
    contactPerson: "Carlos Rivera",
    phone: "+1 (713) 555-0111",
    email: "accounts@metrobeverage.com",
    address: "1500 Commerce St, Houston, TX",
    status: "active",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "sup_cleanhome",
    name: "CleanHome Wholesale",
    contactPerson: "Linda Park",
    phone: "+1 (503) 555-0155",
    email: "wholesale@cleanhome.com",
    address: "77 Riverside Dr, Portland, OR",
    status: "active",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-03-19T09:00:00Z",
  },
  {
    id: "sup_dailybakery",
    name: "Daily Bakery Partners",
    contactPerson: "Omar Farooq",
    phone: "+1 (646) 555-0187",
    email: "partners@dailybakery.com",
    address: "12 Baker St, New York, NY",
    status: "inactive",
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: "2024-04-02T09:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

interface ProductSeedInput {
  name: string;
  categoryId: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  unit: Product["unit"];
  supplierId: string;
  supplier: string;
  image: string;
  description: string;
  status?: Product["status"];
}

const rawProducts: ProductSeedInput[] = [
  { name: "Coca-Cola 500ml", categoryId: "cat_beverages", category: "Beverages", purchasePrice: 0.45, sellingPrice: 1.25, currentStock: 240, minimumStock: 50, unit: "pc", supplierId: "sup_metrobev", supplier: "Metro Beverage Supply", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=300&fit=crop", description: "Classic carbonated soft drink, 500ml bottle." },
  { name: "Orange Juice 1L", categoryId: "cat_beverages", category: "Beverages", purchasePrice: 1.8, sellingPrice: 3.49, currentStock: 60, minimumStock: 20, unit: "pc", supplierId: "sup_metrobev", supplier: "Metro Beverage Supply", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=300&fit=crop", description: "100% pure squeezed orange juice, no added sugar." },
  { name: "Mineral Water 1.5L", categoryId: "cat_beverages", category: "Beverages", purchasePrice: 0.3, sellingPrice: 0.99, currentStock: 8, minimumStock: 40, unit: "pc", supplierId: "sup_metrobev", supplier: "Metro Beverage Supply", image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=300&h=300&fit=crop", description: "Natural spring water, 1.5 litre bottle." },
  { name: "Ground Coffee 250g", categoryId: "cat_beverages", category: "Beverages", purchasePrice: 3.2, sellingPrice: 6.99, currentStock: 35, minimumStock: 15, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop", description: "Medium roast ground coffee, 250g bag." },
  { name: "Green Tea Bags (25ct)", categoryId: "cat_beverages", category: "Beverages", purchasePrice: 1.5, sellingPrice: 3.29, currentStock: 50, minimumStock: 20, unit: "box", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&h=300&fit=crop", description: "Premium green tea, box of 25 bags." },

  { name: "Potato Chips 150g", categoryId: "cat_snacks", category: "Snacks & Confectionery", purchasePrice: 0.9, sellingPrice: 2.19, currentStock: 90, minimumStock: 30, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop", description: "Classic salted potato chips, 150g bag." },
  { name: "Milk Chocolate Bar 100g", categoryId: "cat_snacks", category: "Snacks & Confectionery", purchasePrice: 0.7, sellingPrice: 1.79, currentStock: 120, minimumStock: 40, unit: "pc", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop", description: "Smooth milk chocolate bar, 100g." },
  { name: "Digestive Biscuits 300g", categoryId: "cat_snacks", category: "Snacks & Confectionery", purchasePrice: 1.1, sellingPrice: 2.49, currentStock: 4, minimumStock: 25, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&h=300&fit=crop", description: "Wholegrain digestive biscuits, 300g pack." },
  { name: "Mixed Nuts 200g", categoryId: "cat_snacks", category: "Snacks & Confectionery", purchasePrice: 2.4, sellingPrice: 4.99, currentStock: 45, minimumStock: 15, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=300&fit=crop", description: "Roasted and salted mixed nuts, 200g." },
  { name: "Gummy Bears 250g", categoryId: "cat_snacks", category: "Snacks & Confectionery", purchasePrice: 1.0, sellingPrice: 2.29, currentStock: 65, minimumStock: 20, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300&h=300&fit=crop", description: "Fruit-flavoured gummy candy, 250g bag." },

  { name: "Whole Milk 1L", categoryId: "cat_dairy", category: "Dairy & Eggs", purchasePrice: 0.85, sellingPrice: 1.69, currentStock: 70, minimumStock: 30, unit: "pc", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop", description: "Fresh whole milk, 1 litre carton." },
  { name: "Free-Range Eggs (12ct)", categoryId: "cat_dairy", category: "Dairy & Eggs", purchasePrice: 1.9, sellingPrice: 3.59, currentStock: 55, minimumStock: 20, unit: "box", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=300&h=300&fit=crop", description: "Free-range eggs, box of 12." },
  { name: "Cheddar Cheese 200g", categoryId: "cat_dairy", category: "Dairy & Eggs", purchasePrice: 2.1, sellingPrice: 4.29, currentStock: 30, minimumStock: 15, unit: "pack", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=300&h=300&fit=crop", description: "Aged cheddar cheese block, 200g." },
  { name: "Greek Yoghurt 500g", categoryId: "cat_dairy", category: "Dairy & Eggs", purchasePrice: 1.6, sellingPrice: 3.19, currentStock: 6, minimumStock: 20, unit: "pc", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1571212515416-fca88c2d5b8e?w=300&h=300&fit=crop", description: "Thick and creamy Greek yoghurt, 500g tub." },
  { name: "Salted Butter 250g", categoryId: "cat_dairy", category: "Dairy & Eggs", purchasePrice: 1.4, sellingPrice: 2.99, currentStock: 40, minimumStock: 15, unit: "pack", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop", description: "Creamy salted butter, 250g block." },

  { name: "Sourdough Loaf", categoryId: "cat_bakery", category: "Bakery", purchasePrice: 1.5, sellingPrice: 3.49, currentStock: 18, minimumStock: 10, unit: "pc", supplierId: "sup_dailybakery", supplier: "Daily Bakery Partners", image: "https://images.unsplash.com/photo-1585478259715-4d3a5f3f9a63?w=300&h=300&fit=crop", description: "Artisan sourdough bread loaf." },
  { name: "Croissants (6ct)", categoryId: "cat_bakery", category: "Bakery", purchasePrice: 2.2, sellingPrice: 4.49, currentStock: 0, minimumStock: 10, unit: "box", supplierId: "sup_dailybakery", supplier: "Daily Bakery Partners", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop", description: "Buttery croissants, box of 6." },
  { name: "Chocolate Muffins (4ct)", categoryId: "cat_bakery", category: "Bakery", purchasePrice: 1.8, sellingPrice: 3.99, currentStock: 22, minimumStock: 10, unit: "box", supplierId: "sup_dailybakery", supplier: "Daily Bakery Partners", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=300&fit=crop", description: "Double chocolate chip muffins, box of 4." },

  { name: "Bananas (1kg)", categoryId: "cat_produce", category: "Fruits & Vegetables", purchasePrice: 0.5, sellingPrice: 1.19, currentStock: 85, minimumStock: 30, unit: "kg", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop", description: "Fresh ripe bananas, sold per kg." },
  { name: "Roma Tomatoes (1kg)", categoryId: "cat_produce", category: "Fruits & Vegetables", purchasePrice: 0.7, sellingPrice: 1.59, currentStock: 12, minimumStock: 25, unit: "kg", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1546094324-8b93b4241211?w=300&h=300&fit=crop", description: "Fresh Roma tomatoes, sold per kg." },
  { name: "Baby Spinach 250g", categoryId: "cat_produce", category: "Fruits & Vegetables", purchasePrice: 0.9, sellingPrice: 2.19, currentStock: 28, minimumStock: 15, unit: "pack", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop", description: "Washed baby spinach leaves, 250g." },
  { name: "Red Apples (1kg)", categoryId: "cat_produce", category: "Fruits & Vegetables", purchasePrice: 0.95, sellingPrice: 2.29, currentStock: 66, minimumStock: 25, unit: "kg", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop", description: "Crisp red apples, sold per kg." },
  { name: "Avocados (4ct)", categoryId: "cat_produce", category: "Fruits & Vegetables", purchasePrice: 1.6, sellingPrice: 3.49, currentStock: 3, minimumStock: 15, unit: "pack", supplierId: "sup_freshfarm", supplier: "FreshFarm Distributors", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop", description: "Ripe Hass avocados, pack of 4." },

  { name: "Chicken Breast (1kg)", categoryId: "cat_meat", category: "Meat & Seafood", purchasePrice: 3.2, sellingPrice: 5.99, currentStock: 40, minimumStock: 15, unit: "kg", supplierId: "sup_coastal", supplier: "Coastal Seafood Co.", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop", description: "Boneless skinless chicken breast, per kg." },
  { name: "Salmon Fillet (500g)", categoryId: "cat_meat", category: "Meat & Seafood", purchasePrice: 5.5, sellingPrice: 9.99, currentStock: 16, minimumStock: 10, unit: "pack", supplierId: "sup_coastal", supplier: "Coastal Seafood Co.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=300&fit=crop", description: "Fresh Atlantic salmon fillet, 500g." },
  { name: "Ground Beef (500g)", categoryId: "cat_meat", category: "Meat & Seafood", purchasePrice: 3.8, sellingPrice: 6.49, currentStock: 2, minimumStock: 12, unit: "pack", supplierId: "sup_coastal", supplier: "Coastal Seafood Co.", image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=300&h=300&fit=crop", description: "Lean ground beef, 500g pack." },
  { name: "Shrimp (400g)", categoryId: "cat_meat", category: "Meat & Seafood", purchasePrice: 6.2, sellingPrice: 11.49, currentStock: 20, minimumStock: 10, unit: "pack", supplierId: "sup_coastal", supplier: "Coastal Seafood Co.", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&h=300&fit=crop", description: "Peeled and deveined shrimp, 400g." },

  { name: "Dish Soap 750ml", categoryId: "cat_household", category: "Household Supplies", purchasePrice: 1.1, sellingPrice: 2.49, currentStock: 58, minimumStock: 20, unit: "pc", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop", description: "Concentrated dish washing liquid, 750ml." },
  { name: "Paper Towels (6 rolls)", categoryId: "cat_household", category: "Household Supplies", purchasePrice: 3.5, sellingPrice: 6.99, currentStock: 34, minimumStock: 15, unit: "pack", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=300&h=300&fit=crop", description: "Absorbent paper towels, pack of 6 rolls." },
  { name: "Laundry Detergent 2L", categoryId: "cat_household", category: "Household Supplies", purchasePrice: 4.2, sellingPrice: 8.49, currentStock: 9, minimumStock: 12, unit: "pc", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1610557892470-55d587e10a26?w=300&h=300&fit=crop", description: "Liquid laundry detergent, 2 litre bottle." },
  { name: "Trash Bags (30ct)", categoryId: "cat_household", category: "Household Supplies", purchasePrice: 2.0, sellingPrice: 4.19, currentStock: 42, minimumStock: 15, unit: "box", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1610557892470-55d587e10a26?w=300&h=300&fit=crop", description: "Heavy-duty trash bags, box of 30." },

  { name: "Toothpaste 100ml", categoryId: "cat_personal", category: "Personal Care", purchasePrice: 0.8, sellingPrice: 1.99, currentStock: 75, minimumStock: 25, unit: "pc", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1559591935-c6c92c6d3399?w=300&h=300&fit=crop", description: "Fluoride toothpaste, 100ml tube." },
  { name: "Shampoo 400ml", categoryId: "cat_personal", category: "Personal Care", purchasePrice: 1.9, sellingPrice: 4.49, currentStock: 38, minimumStock: 15, unit: "pc", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop", description: "Moisturising shampoo, 400ml bottle." },
  { name: "Bar Soap (3 pack)", categoryId: "cat_personal", category: "Personal Care", purchasePrice: 1.0, sellingPrice: 2.29, currentStock: 5, minimumStock: 20, unit: "pack", supplierId: "sup_cleanhome", supplier: "CleanHome Wholesale", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=300&h=300&fit=crop", description: "Moisturising bar soap, pack of 3." },

  { name: "Frozen Pizza (Margherita)", categoryId: "cat_frozen", category: "Frozen Foods", purchasePrice: 2.4, sellingPrice: 4.99, currentStock: 26, minimumStock: 15, unit: "pc", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop", description: "Frozen Margherita pizza, ready to bake." },
  { name: "Vanilla Ice Cream 1L", categoryId: "cat_frozen", category: "Frozen Foods", purchasePrice: 2.1, sellingPrice: 4.49, currentStock: 31, minimumStock: 15, unit: "pc", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=300&fit=crop", description: "Creamy vanilla ice cream, 1 litre tub." },
  { name: "Frozen Mixed Vegetables 1kg", categoryId: "cat_frozen", category: "Frozen Foods", purchasePrice: 1.3, sellingPrice: 2.99, currentStock: 0, minimumStock: 15, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=300&h=300&fit=crop", description: "Frozen mixed vegetables, 1kg bag." },

  { name: "Basmati Rice 5kg", categoryId: "cat_grains", category: "Grains, Rice & Pasta", purchasePrice: 5.5, sellingPrice: 9.99, currentStock: 48, minimumStock: 20, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop", description: "Premium long-grain basmati rice, 5kg bag." },
  { name: "Spaghetti 500g", categoryId: "cat_grains", category: "Grains, Rice & Pasta", purchasePrice: 0.7, sellingPrice: 1.69, currentStock: 62, minimumStock: 25, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&h=300&fit=crop", description: "Durum wheat spaghetti, 500g pack." },
  { name: "Rolled Oats 1kg", categoryId: "cat_grains", category: "Grains, Rice & Pasta", purchasePrice: 1.4, sellingPrice: 2.99, currentStock: 14, minimumStock: 15, unit: "pack", supplierId: "sup_goldenvalley", supplier: "Golden Valley Foods", image: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300&h=300&fit=crop", description: "Whole grain rolled oats, 1kg bag." },
];

let productSeq = 1000;
let barcodeSeq = 0;

export const seedProducts: Product[] = rawProducts.map((item, index) => {
  productSeq += 1;
  barcodeSeq += 1;
  const now = new Date();
  const createdAt = new Date(now.getTime() - (rawProducts.length - index) * 86400000 * 3).toISOString();
  return {
    id: `prod_${productSeq}`,
    name: item.name,
    image: item.image,
    sku: `${item.category.slice(0, 3).toUpperCase()}-${String(productSeq).padStart(5, "0")}`,
    barcode: generateBarcode(),
    qrCode: generateQrValue(productSeq),
    categoryId: item.categoryId,
    category: item.category,
    purchasePrice: item.purchasePrice,
    sellingPrice: item.sellingPrice,
    currentStock: item.currentStock,
    minimumStock: item.minimumStock,
    unit: item.unit,
    description: item.description,
    supplierId: item.supplierId,
    supplier: item.supplier,
    status: item.status ?? "active",
    createdAt,
    updatedAt: createdAt,
  };
});

// Backfill category product counts
seedCategories.forEach((cat) => {
  cat.productCount = seedProducts.filter((p) => p.categoryId === cat.id).length;
});

// ---------------------------------------------------------------------------
// Purchases (a handful of historical + one draft)
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function buildPurchaseItems(products: Product[]): Purchase["items"] {
  return products.map((p, i) => {
    const quantity = 20 + i * 10;
    return {
      id: `pi_${p.id}_${i}`,
      productId: p.id,
      productName: p.name,
      productImage: p.image,
      availableStock: p.currentStock,
      quantity,
      purchasePrice: p.purchasePrice,
      lineTotal: Number((quantity * p.purchasePrice).toFixed(2)),
    };
  });
}

const purchaseGroups: Array<{ supplierId: string; supplierName: string; productIds: string[] }> = [
  { supplierId: "sup_freshfarm", supplierName: "FreshFarm Distributors", productIds: seedProducts.filter((p) => p.supplierId === "sup_freshfarm").slice(0, 3).map((p) => p.id) },
  { supplierId: "sup_goldenvalley", supplierName: "Golden Valley Foods", productIds: seedProducts.filter((p) => p.supplierId === "sup_goldenvalley").slice(0, 4).map((p) => p.id) },
  { supplierId: "sup_coastal", supplierName: "Coastal Seafood Co.", productIds: seedProducts.filter((p) => p.supplierId === "sup_coastal").slice(0, 2).map((p) => p.id) },
  { supplierId: "sup_metrobev", supplierName: "Metro Beverage Supply", productIds: seedProducts.filter((p) => p.supplierId === "sup_metrobev").slice(0, 3).map((p) => p.id) },
];

export const seedPurchases: Purchase[] = purchaseGroups.map((group, index) => {
  const items = buildPurchaseItems(seedProducts.filter((p) => group.productIds.includes(p.id)));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const discount = index === 1 ? 15 : 0;
  const isDraft = index === purchaseGroups.length - 1;
  return {
    id: `pur_${index + 1}`,
    purchaseNumber: `PO-2026-${String(index + 1).padStart(5, "0")}`,
    supplierId: group.supplierId,
    supplierName: group.supplierName,
    purchaseDate: daysAgo((purchaseGroups.length - index) * 4),
    paymentStatus: isDraft ? "unpaid" : index === 0 ? "paid" : "partial",
    status: isDraft ? "draft" : "completed",
    notes: isDraft ? "Awaiting confirmation from supplier before completing." : undefined,
    items,
    subtotal: Number(subtotal.toFixed(2)),
    discount,
    total: Number((subtotal - discount).toFixed(2)),
    createdAt: daysAgo((purchaseGroups.length - index) * 4),
    updatedAt: daysAgo((purchaseGroups.length - index) * 4),
  };
});

// ---------------------------------------------------------------------------
// Sales (last ~14 days)
// ---------------------------------------------------------------------------

const cashiers = [
  { id: "user_cashier", name: "Sana Tariq" },
  { id: "user_cashier2", name: "Hamza Sheikh" },
  { id: "user_admin", name: "Ayesha Raza" },
];

const customerNames = ["Walk-in Customer", "Walk-in Customer", "Walk-in Customer", "John Whitfield", "Maria Gomez", "Walk-in Customer", "Ahsan Iqbal"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export const seedSales: Sale[] = Array.from({ length: 42 }).map((_, index) => {
  const cashier = pick(cashiers, index);
  const numItems = 1 + (index % 4);
  const items: Sale["items"] = Array.from({ length: numItems }).map((__, i) => {
    const product = pick(seedProducts, index * 3 + i);
    const quantity = 1 + ((index + i) % 3);
    return {
      id: `si_${index}_${i}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      quantity,
      unitPrice: product.sellingPrice,
      lineTotal: Number((quantity * product.sellingPrice).toFixed(2)),
    };
  });
  const subtotal = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  const discount = index % 7 === 0 ? Number((subtotal * 0.05).toFixed(2)) : 0;
  const tax = Number(((subtotal - discount) * 0.08).toFixed(2));
  const total = Number((subtotal - discount + tax).toFixed(2));
  const method: Sale["payment"]["method"] = index % 3 === 0 ? "card" : index % 3 === 1 ? "cash" : "online";
  const createdAt = new Date(Date.now() - index * 5 * 3600000).toISOString();
  return {
    id: `sale_${index + 1}`,
    invoiceNumber: `INV-2026-${String(index + 1).padStart(5, "0")}`,
    customerName: pick(customerNames, index),
    cashierId: cashier.id,
    cashierName: cashier.name,
    items,
    subtotal,
    discount,
    tax,
    total,
    payment: {
      method,
      amountReceived: method === "cash" ? Math.ceil(total / 5) * 5 : undefined,
      change: method === "cash" ? Number((Math.ceil(total / 5) * 5 - total).toFixed(2)) : undefined,
    },
    paymentStatus: "paid",
    status: "completed",
    createdAt,
  };
});

// ---------------------------------------------------------------------------
// Stock history (derived from purchases + sales + a few manual adjustments)
// ---------------------------------------------------------------------------

export const seedStockHistory: StockHistory[] = [];

seedPurchases
  .filter((p) => p.status === "completed")
  .forEach((purchase) => {
    purchase.items.forEach((item) => {
      seedStockHistory.push({
        id: `sh_${generateIdLike()}`,
        productId: item.productId,
        productName: item.productName,
        source: "purchase",
        type: "add",
        quantityChanged: item.quantity,
        previousQuantity: item.availableStock,
        newQuantity: item.availableStock + item.quantity,
        reason: `Purchase ${purchase.purchaseNumber} received from ${purchase.supplierName}`,
        userId: "user_manager",
        userName: "Bilal Ahmed",
        referenceId: purchase.id,
        createdAt: purchase.purchaseDate,
      });
    });
  });

seedSales.slice(0, 20).forEach((sale) => {
  sale.items.forEach((item) => {
    const product = seedProducts.find((p) => p.id === item.productId);
    if (!product) return;
    seedStockHistory.push({
      id: `sh_${generateIdLike()}`,
      productId: item.productId,
      productName: item.productName,
      source: "sale",
      type: "remove",
      quantityChanged: item.quantity,
      previousQuantity: product.currentStock + item.quantity,
      newQuantity: product.currentStock,
      reason: `Sale ${sale.invoiceNumber}`,
      userId: sale.cashierId,
      userName: sale.cashierName,
      referenceId: sale.id,
      createdAt: sale.createdAt,
    });
  });
});

seedStockHistory.push(
  {
    id: `sh_${generateIdLike()}`,
    productId: seedProducts[7].id,
    productName: seedProducts[7].name,
    source: "adjustment",
    type: "remove",
    quantityChanged: 5,
    previousQuantity: seedProducts[7].currentStock + 5,
    newQuantity: seedProducts[7].currentStock,
    reason: "Damaged packaging found during shelf check",
    userId: "user_manager",
    userName: "Bilal Ahmed",
    createdAt: daysAgo(2),
  },
  {
    id: `sh_${generateIdLike()}`,
    productId: seedProducts[17].id,
    productName: seedProducts[17].name,
    source: "adjustment",
    type: "add",
    quantityChanged: 10,
    previousQuantity: seedProducts[17].currentStock - 10,
    newQuantity: seedProducts[17].currentStock,
    reason: "Recount correction after stocktake",
    userId: "user_admin",
    userName: "Ayesha Raza",
    createdAt: daysAgo(1),
  },
);

function generateIdLike(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 100000).toString(36)}`;
}

// ---------------------------------------------------------------------------
// Supplier purchase totals (backfilled from seedPurchases)
// ---------------------------------------------------------------------------

seedSuppliers.forEach((supplier) => {
  const purchases = seedPurchases.filter((p) => p.supplierId === supplier.id && p.status === "completed");
  supplier.purchaseCount = purchases.length;
  supplier.totalPurchases = Number(purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2));
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const seedNotifications: AppNotification[] = [
  { id: "notif_1", type: "out-of-stock", title: "Out of stock", message: "Croissants (6ct) is now out of stock.", read: false, createdAt: daysAgo(0), link: "/inventory" },
  { id: "notif_2", type: "low-stock", title: "Low stock alert", message: "Ground Beef (500g) has only 2 units left.", read: false, createdAt: daysAgo(0), link: "/inventory" },
  { id: "notif_3", type: "sale-completed", title: "Sale completed", message: "Invoice INV-2026-00042 for $18.40 completed.", read: false, createdAt: daysAgo(0), link: "/sales" },
  { id: "notif_4", type: "purchase-completed", title: "Purchase completed", message: "Purchase PO-2026-00001 from FreshFarm Distributors marked complete.", read: true, createdAt: daysAgo(4), link: "/purchases" },
  { id: "notif_5", type: "inventory-adjusted", title: "Inventory adjusted", message: "Stock recount correction applied to Bar Soap (3 pack).", read: true, createdAt: daysAgo(1), link: "/inventory/history" },
  { id: "notif_6", type: "low-stock", title: "Low stock alert", message: "Avocados (4ct) is running low (3 units left).", read: true, createdAt: daysAgo(2), link: "/inventory" },
];

// ---------------------------------------------------------------------------
// Store settings
// ---------------------------------------------------------------------------

export const seedSettings: StoreSettings = {
  storeName: "SmartMart",
  storeLogo: undefined,
  storeAddress: "482 Market Street, San Francisco, CA 94103",
  storePhone: "+1 (415) 555-0100",
  storeEmail: "hello@smartmart.com",
  currency: "USD",
  taxPercentage: 8,
  receiptFooter: "Thank you for shopping at SmartMart!",
  lowStockDefaultLevel: 15,
  dateFormat: "MMM DD, YYYY",
  timeFormat: "12h",
};
