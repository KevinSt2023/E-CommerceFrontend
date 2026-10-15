export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  parentId?: string;
  sortOrder: number;
  children: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage: number;
  isOnSale: boolean;
  condition: string;
  brandName?: string;
  categoryName: string;
  primaryImageUrl?: string;
  ratingAverage: number;
  ratingCount: number;
  isInStock: boolean;
  isFeatured: boolean;
  warrantyMonths: number;
}

export interface ProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSpec {
  group: string;
  name: string;
  value: string;
  sortOrder: number;
}

export interface ProductDetail extends ProductListItem {
  barcode?: string;
  description?: string;
  model?: string;
  mpn?: string;
  availableStock: number;
  allowBackorder: boolean;
  maxOrderQuantity?: number;
  weightKg?: number;
  soldCount: number;
  categorySlug: string;
  images: ProductImage[];
  specifications: ProductSpec[];
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  primaryImageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  inStock: boolean;
  maxOrderQuantity?: number;
  issue?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  lineCount: number;
  subtotal: number;
  taxableAmount: number;
  igvAmount: number;
  total: number;
  currency: string;
  hasIssues: boolean;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocumentType: string; // Dni | Ruc
  customerDocumentNumber?: string;
  requestedDocument: string; // Boleta | Factura
  shippingRecipient: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingDepartment: string;
  shippingProvince: string;
  shippingDistrict: string;
  couponCode?: string;
  paymentMethod: string;
  notes?: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderInvoiceDto {
  id: string;
  documentType: string;
  fullNumber: string;
  status: string;
  pdfUrl?: string;
}

/** Configuración pública del negocio (la sirve /api/settings). Reglas de negocio centralizadas. */
export interface PublicSettings {
  storeName: string;
  legalName?: string;
  ruc?: string;
  slogan?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  whatsApp?: string;
  addressLine?: string;
  district?: string;
  department?: string;
  currency: string;
  igvRate: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  payCardEnabled: boolean;
  payTransferEnabled: boolean;
  payCashOnDeliveryEnabled: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankCci?: string;
  bankAccountHolder?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocumentType: string;
  customerDocumentNumber?: string;
  requestedDocument: string;
  shippingRecipient: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingDepartment: string;
  shippingProvince: string;
  shippingDistrict: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currency: string;
  couponCode?: string;
  createdAtUtc: string;
  paidAtUtc?: string;
  items: OrderItemDto[];
  invoice?: OrderInvoiceDto;
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
  refreshToken: string; // vacío: vive solo en la cookie HttpOnly
  requiresTwoFactor: boolean;
  twoFactorToken?: string;
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
}

export interface TwoFactorEnableResult {
  recoveryCodes: string[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
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

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAtUtc: string;
}

export interface CreateIntentResult {
  orderNumber: string;
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
}

export interface ProductQuery {
  search?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  onSaleOnly?: boolean;
  condition?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}
