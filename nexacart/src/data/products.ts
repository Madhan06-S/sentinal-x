import { Product } from '../types/commerce';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'ApexBook Pro 16" Workstation',
    category: 'Laptops',
    price: 2499.00,
    originalPrice: 2699.00,
    rating: 4.9,
    reviewCount: 342,
    description: 'Ultra-performance enterprise laptop engineered for high-concurrency development, data pipelines, and creative workflows.',
    features: [
      '16-core NextGen Silicon Architecture',
      '32GB Unified LPDDR5X Memory',
      '1TB PCIe 4.0 NVMe Solid State Storage',
      'Liquid Retina XDR Display with ProMotion (120Hz)',
      'Up to 22 hours enterprise battery life'
    ],
    stock: 24,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    badge: 'Enterprise Choice',
    modelNumber: 'NXC-NB-16P'
  },
  {
    id: 'prod-02',
    name: 'SonicWave Elite ANC Headphones',
    category: 'Audio',
    price: 349.00,
    originalPrice: 399.00,
    rating: 4.8,
    reviewCount: 819,
    description: 'Studio-mastered wireless acoustics with active multi-point noise cancellation and ultra-low latency playback.',
    features: [
      'Hybrid Adaptive Noise Cancellation (ANC)',
      'Custom 40mm Beryllium dynamic drivers',
      '45-hour continuous runtime with Fast Fuel recharge',
      'Hi-Res Audio Wireless certification with LDAC',
      'Quad-beamforming microphone array for clear calls'
    ],
    stock: 58,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badge: 'Top Rated',
    modelNumber: 'NXC-AU-700'
  },
  {
    id: 'prod-03',
    name: 'Horizon 10 Pro 5G Flagship',
    category: 'Smartphones',
    price: 1099.00,
    rating: 4.7,
    reviewCount: 450,
    description: 'Precision-milled aerospace titanium smartphone with pro-grade imaging sensors and next-generation neural processing.',
    features: [
      '6.7-inch Super AMOLED display (1-120Hz LTPO)',
      'Triple 50MP Sony Optical Sensor Suite with OIS',
      '512GB Ultra-fast UFS 4.0 onboard storage',
      'IP68 certified water and dust resistance',
      'Dual SIM 5G Sub-6 & mmWave connectivity'
    ],
    stock: 19,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    modelNumber: 'NXC-PH-10P'
  },
  {
    id: 'prod-04',
    name: 'TactileForge Tenkeyless Mechanical Keyboard',
    category: 'Peripherals',
    price: 189.00,
    originalPrice: 219.00,
    rating: 4.9,
    reviewCount: 520,
    description: 'CNC anodized aluminum body featuring hot-swappable tactile switches, sound-dampening silicone gaskets, and per-key RGB.',
    features: [
      'Hot-swappable 5-pin mechanical switch sockets',
      'Machined 6063 aerospace aluminum case',
      'Double-shot PBT keycaps with crisp legends',
      'Tri-mode connectivity: 2.4GHz wireless, Bluetooth 5.2, USB-C',
      'Factory pre-lubed stabilizers for clean acoustic feel'
    ],
    stock: 73,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller',
    modelNumber: 'NXC-KB-TKL'
  },
  {
    id: 'prod-05',
    name: 'PulseTrack V4 Sport Titanium Watch',
    category: 'Wearables',
    price: 429.00,
    rating: 4.8,
    reviewCount: 290,
    description: 'Grade-5 titanium smart wearable offering medical-grade biometric monitoring, sapphire crystal glass, and dual-band GPS.',
    features: [
      'Sapphire crystal glass with 2000-nit peak AMOLED',
      'Medical-grade ECG and continuous SpO2 biometric sensors',
      'Dual-frequency multiband L1/L5 GPS navigation',
      '100-meter water resistance with dive computer metrics',
      '14-day standard battery duration'
    ],
    stock: 31,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    modelNumber: 'NXC-WT-V4'
  },
  {
    id: 'prod-06',
    name: 'UltraView 34" Curved 4K Monitor',
    category: 'Displays',
    price: 849.00,
    originalPrice: 949.00,
    rating: 4.9,
    reviewCount: 168,
    description: 'Immersive 1900R curvature ultra-wide professional panel with factory calibration and single-cable 90W USB-C docking.',
    features: [
      '34-inch WQHD (3440 x 1440) Nano-IPS curved panel',
      '98% DCI-P3 wide color gamut with Delta E < 2 accuracy',
      '144Hz refresh rate with NVIDIA G-Sync compatibility',
      'USB-C 90W Power Delivery with integrated KVM switch',
      'Ergonomic height, tilt, and swivel precision stand'
    ],
    stock: 14,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    badge: 'Limited Stock',
    modelNumber: 'NXC-DS-34C'
  }
];
