// Database types
export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface System {
  id: string
  title: string
  description: string | null
  price: number
  original_price: number | null
  category_id: string
  seller_id: string
  condition: 'like-new' | 'excellent' | 'good' | 'fair'
  status: 'active' | 'sold' | 'pending' | 'draft'
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  motherboard: string | null
  psu: string | null
  case_model: string | null
  cooling: string | null
  image_url: string | null
  image_urls: string[] | null
  view_count: number
  favorite_count: number
  created_at: string
  updated_at: string
  // Joined data
  category?: Category
  seller?: User
}

// Component props types
export interface CategoryCardProps {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  hoverGradient: string
  href?: string
}

export interface SystemCardProps {
  system: System
  onHover?: (id: string | null) => void
  isHovered?: boolean
}

export interface NavigationProps {
  isMobileMenuOpen: boolean
  onMobileMenuToggle: () => void
}

// CPU-related types
export interface CPUManufacturer {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  founded_year: number | null
  country: string | null
  created_at: string
  updated_at: string
}

export interface CPUModel {
  id: string
  manufacturer_id: string
  model_name: string
  series: string | null
  generation: string | null
  socket: string | null
  cores: number
  threads: number
  base_clock: number | null
  boost_clock: number | null
  tdp: number | null
  cache_l3: number | null
  memory_support: string | null
  max_memory_speed: number | null
  pcie_lanes: number | null
  integrated_graphics: boolean
  release_date: string | null
  msrp: number | null
  architecture: string | null
  lithography: number | null
  features: string[] | null
  image_url: string | null
  specifications_url: string | null
  created_at: string
  updated_at: string
  // Joined data
  manufacturer?: CPUManufacturer
}

export interface CPUListing {
  id: string
  cpu_model_id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  original_price: number | null
  condition: 'new' | 'like-new' | 'excellent' | 'good' | 'fair'
  status: 'active' | 'sold' | 'pending' | 'draft'
  purchase_date: string | null
  warranty_remaining_months: number | null
  overclocked: boolean
  max_overclock: number | null
  cooling_included: boolean
  original_box: boolean
  original_manual: boolean
  image_urls: string[] | null
  view_count: number
  favorite_count: number
  location: string | null
  shipping_available: boolean
  local_pickup: boolean
  created_at: string
  updated_at: string
  // Joined data
  cpu_model?: CPUModel
  seller?: User
}

export interface CPUFavorite {
  id: string
  user_id: string
  cpu_listing_id: string
  created_at: string
  // Joined data
  cpu_listing?: CPUListing
}

// CPU component props types
export interface CPUCardProps {
  cpuListing: CPUListing
  onHover?: (id: string | null) => void
  isHovered?: boolean
}

export interface CPUFilterProps {
  manufacturers: string[]
  sockets: string[]
  cores: number[]
  priceRange: [number, number]
  condition: string[]
  onFilterChange: (filters: CPUFilters) => void
}

export interface CPUFilters {
  manufacturers: string[]
  sockets: string[]
  cores: number[]
  priceRange: [number, number]
  condition: string[]
  search: string
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popularity'
}

export interface CPUComparisonProps {
  cpuListings: CPUListing[]
  onRemove: (id: string) => void
  onClear: () => void
}

// GPU-related types
export interface GPUListing {
  id: string
  gpu_model_id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  original_price: number | null
  condition: 'new' | 'like-new' | 'excellent' | 'good' | 'fair'
  status: 'active' | 'sold' | 'pending' | 'draft'
  purchase_date: string | null
  warranty_remaining_months: number | null
  overclocked: boolean
  max_overclock: number | null
  cooling_included: boolean
  original_box: boolean
  original_manual: boolean
  image_urls: string[] | null
  view_count: number
  favorite_count: number
  location: string | null
  shipping_available: boolean
  local_pickup: boolean
  created_at: string
  updated_at: string
  // Joined data
  gpu_model?: {
    id: string
    manufacturer_id: string
    model_name: string
    series?: string | null
    generation?: string | null
    architecture?: string | null
    memory_type?: string | null
    memory_size?: number | null
    memory_bus_width?: number | null
    base_clock?: number | null
    boost_clock?: number | null
    memory_clock?: number | null
    cuda_cores?: number | null
    stream_processors?: number | null
    ray_tracing_cores?: number | null
    tensor_cores?: number | null
    tdp?: number | null
    pcie_version?: string | null
    display_outputs?: string[] | null
    vr_ready?: boolean | null
    release_date?: string | null
    msrp?: number | null
    features?: string[] | null
    image_url?: string | null
    specifications_url?: string | null
    created_at: string
    updated_at: string
    manufacturer?: {
      id: string
      name: string
      description?: string | null
      logo_url?: string | null
      website_url?: string | null
      founded_year?: number | null
      country?: string | null
      created_at: string
      updated_at: string
    }
  }
  seller?: User
}

export interface GPUComparisonProps {
  gpuListings: GPUListing[]
  onRemove: (id: string) => void
  onClear: () => void
}

export interface SystemComparisonProps {
  systems: System[]
  onRemove: (id: string) => void
  onClear: () => void
}

// User rating types
export interface UserRating {
  id: string
  conversation_id: string
  rater_id: string
  rated_user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  // Joined data
  rater?: User
  rated_user?: User
}
