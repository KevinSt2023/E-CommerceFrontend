export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse extends AuthUser {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  twoFactorToken?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  documentType: string;
  documentNumber?: string;
  twoFactorEnabled: boolean;
}

export interface TwoFactorSetup { secret: string; otpauthUri: string; }
export interface TwoFactorEnableResult { recoveryCodes: string[]; }

// Dashboard
export interface SalesPoint { date: string; total: number; orders: number; }
export interface TopProduct { name: string; sku: string; soldCount: number; price: number; }
export interface RecentOrder {
  orderNumber: string; customerName: string; total: number; status: string; paymentStatus: string; createdAtUtc: string;
}
export interface Dashboard {
  revenueTotal: number; revenueToday: number; revenueMonth: number;
  ordersTotal: number; ordersPending: number; ordersPaid: number;
  customersCount: number; productsCount: number; lowStockCount: number; avgTicket: number;
  salesLast7Days: SalesPoint[]; topProducts: TopProduct[]; recentOrders: RecentOrder[];
}

// Orders
export interface OrderSummary {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  total: number; currency: string; itemCount: number; createdAtUtc: string;
}
export interface OrderItem {
  productId: string; productName: string; sku: string; quantity: number; unitPrice: number; lineTotal: number;
}
export interface OrderInvoice { id: string; documentType: string; fullNumber: string; status: string; pdfUrl?: string; }
export interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string;
  customerName: string; customerEmail: string; customerPhone: string;
  customerDocumentType: string; customerDocumentNumber?: string; requestedDocument: string;
  shippingRecipient: string; shippingLine1: string; shippingLine2?: string;
  shippingDepartment: string; shippingProvince: string; shippingDistrict: string;
  subtotal: number; discountAmount: number; shippingCost: number; taxAmount: number; total: number; currency: string;
  couponCode?: string; createdAtUtc: string; paidAtUtc?: string;
  items: OrderItem[]; invoice?: OrderInvoice;
}

// Inventory
export interface ProductStock {
  productId: string; sku: string; name: string; stock: number; reservedStock: number;
  availableStock: number; lowStockThreshold: number;
}
export interface LowStockItem {
  productId: string; sku: string; barcode?: string; name: string;
  stock: number; reservedStock: number; availableStock: number; lowStockThreshold: number;
}
export interface StockMovement {
  id: string; productId: string; productName: string; productSku: string;
  type: string; quantity: number; stockAfter: number; reference?: string; notes?: string; createdAtUtc: string;
}
export interface ProductScan {
  id: string; sku: string; barcode?: string; name: string; price: number; cost?: number;
  stock: number; reservedStock: number; availableStock: number; isActive: boolean; primaryImageUrl?: string;
}

// Catálogo admin
export interface AdminProductListItem {
  id: string; sku: string; barcode?: string; name: string; price: number; compareAtPrice?: number;
  stock: number; availableStock: number; categoryName: string; brandName?: string;
  isActive: boolean; isFeatured: boolean; primaryImageUrl?: string;
}
export interface ProductImageInput { url: string; altText?: string; isPrimary: boolean; sortOrder: number; }
export interface ProductSpecInput { group: string; name: string; value: string; sortOrder: number; }
export interface ProductWrite {
  sku: string; barcode?: string; name: string; slug?: string; shortDescription?: string; description?: string;
  model?: string; mpn?: string; condition: string; price: number; compareAtPrice?: number; cost?: number;
  stock: number; lowStockThreshold: number; allowBackorder: boolean; maxOrderQuantity?: number;
  warrantyMonths: number; weightKg?: number; lengthCm?: number; widthCm?: number; heightCm?: number;
  metaTitle?: string; metaDescription?: string; isActive: boolean; isFeatured: boolean;
  categoryId: string; brandId?: string; images: ProductImageInput[]; specifications: ProductSpecInput[];
}
export interface AdminProduct extends ProductWrite { id: string; }

export interface AdminCategory {
  id: string; name: string; slug: string; description?: string; imageUrl?: string; iconName?: string;
  parentId?: string; parentName?: string; sortOrder: number; isActive: boolean; productCount: number;
}
export interface CategoryWrite {
  name: string; slug?: string; description?: string; imageUrl?: string; iconName?: string;
  parentId?: string | null; sortOrder: number; isActive: boolean;
}
export interface AdminBrand {
  id: string; name: string; slug: string; logoUrl?: string; description?: string; isActive: boolean; productCount: number;
}
export interface BrandWrite { name: string; slug?: string; logoUrl?: string; description?: string; isActive: boolean; }

export interface AdminCoupon {
  id: string; code: string; description?: string; isPercentage: boolean; value: number;
  minimumOrderAmount?: number; maxDiscountAmount?: number; startsAtUtc?: string; endsAtUtc?: string;
  usageLimit?: number; isActive: boolean; timesUsed: number;
}
export interface CouponWrite {
  code: string; description?: string; isPercentage: boolean; value: number;
  minimumOrderAmount?: number; maxDiscountAmount?: number; startsAtUtc?: string | null; endsAtUtc?: string | null;
  usageLimit?: number | null; isActive: boolean;
}

// Users
export interface UserListItem {
  id: string; email: string; firstName: string; lastName: string; role: string;
  isActive: boolean; twoFactorEnabled: boolean; phoneNumber?: string;
  documentType: string; documentNumber?: string; createdAtUtc: string; ordersCount: number;
}

// Configuración del negocio
export interface StoreSettings {
  // Identidad
  storeName: string; legalName?: string; ruc?: string; email?: string; phone?: string; whatsApp?: string;
  addressLine?: string; district?: string; province?: string; department?: string;
  // Branding
  logoUrl?: string; slogan?: string;
  // Comercio
  currency: string; igvRate: number; freeShippingThreshold: number; defaultShippingCost: number;
  // Pagos
  payCardEnabled: boolean; payTransferEnabled: boolean; payCashOnDeliveryEnabled: boolean;
  bankName?: string; bankAccountNumber?: string; bankCci?: string; bankAccountHolder?: string;
  // Facturación
  invoicingEnabled: boolean; nubefacToken?: string; boletaSeries: string; facturaSeries: string;
}
