// Internationalization dictionary for English, Cebuano (Visayan), and Filipino

export type LanguageCode = 'en' | 'ceb' | 'fil';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  // Primary Navigation
  navSell: string;
  navProducts: string;
  navInventory: string;
  navToday: string;
  
  // Transaction Workflow Labels
  newSale: string;
  todaysSales: string;
  stockRunningLow: string;
  amountReceived: string;
  change: string;
  creditOwed: string;
  closeDay: string;
  save: string;
  
  // Actions
  checkout: string;
  completeSale: string;
  clearCart: string;
  holdSale: string;
  searchPlaceholder: string;
  allCategories: string;
  favorites: string;
  
  // Payment methods
  cash: string;
  qrph: string;
  creditUtang: string;
  otherPayment: string;
  
  // Payment States
  pendingQR: string;
  merchantConfirmed: string;
  providerConfirmed: string;
  paymentReceived: string;
  refSuffix: string;
  
  // Carinderia specific
  dailyMenu: string;
  prepared: string;
  soldOut: string;
  leftoverWaste: string;
  recordWaste: string;
  
  // Inventory
  stockIn: string;
  adjustment: string;
  movementHistory: string;
  reason: string;
  
  // Store setup
  sariSariStore: string;
  carinderia: string;
  mixedStore: string;
  ownerPin: string;
  
  // Customer & Utang
  customerLedger: string;
  addCustomer: string;
  recordPayment: string;
  currentBalance: string;
  
  // Data Backup
  backupData: string;
  restoreData: string;
  exportCSV: string;
  
  // Disclaimers
  taxDisclaimer: string;
  offlineIndicator: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'TindaHalin',
    tagline: 'Sari-Sari & Carinderia Sales Notebook',
    navSell: 'Sell',
    navProducts: 'Products/Menu',
    navInventory: 'Inventory',
    navToday: 'Today',
    
    newSale: 'New sale',
    todaysSales: 'Today\'s sales',
    stockRunningLow: 'Stock running low',
    amountReceived: 'Amount received',
    change: 'Change',
    creditOwed: 'Credit owed',
    closeDay: 'Close day',
    save: 'Save',
    
    checkout: 'Checkout',
    completeSale: 'Complete Sale',
    clearCart: 'Clear Cart',
    holdSale: 'Hold Cart',
    searchPlaceholder: 'Search products or dishes...',
    allCategories: 'All Categories',
    favorites: 'Favorites',
    
    cash: 'Cash',
    qrph: 'QR Ph (GCash/Maya/BDO)',
    creditUtang: 'Credit (Utang)',
    otherPayment: 'Other',
    
    pendingQR: 'Waiting for QR Payment',
    merchantConfirmed: 'Merchant Confirmed',
    providerConfirmed: 'Provider Verified',
    paymentReceived: 'Payment Received',
    refSuffix: 'Ref Last 4-6 Digits',
    
    dailyMenu: 'Today\'s Carinderia Menu',
    prepared: 'Prepared Servings',
    soldOut: 'Mark Sold Out',
    leftoverWaste: 'Leftover / Waste',
    recordWaste: 'Record Waste',
    
    stockIn: 'Stock-In (Restock)',
    adjustment: 'Stock Adjustment',
    movementHistory: 'Movement History',
    reason: 'Reason (Delivery, Expired, Recount)',
    
    sariSariStore: 'Sari-Sari Store',
    carinderia: 'Carinderia / Eatery',
    mixedStore: 'Combined Tindahan & Carinderia',
    ownerPin: 'Owner Security PIN',
    
    customerLedger: 'Utang Ledger',
    addCustomer: 'Add New Suki',
    recordPayment: 'Record Utang Payment',
    currentBalance: 'Total Utang Owed',
    
    backupData: 'Backup Database (JSON)',
    restoreData: 'Restore from Backup',
    exportCSV: 'Export to CSV',
    
    taxDisclaimer: 'Management Record Only — Not a BIR-accredited official receipt system',
    offlineIndicator: '100% Offline Mode Active',
  },
  ceb: {
    appName: 'TindaHalin',
    tagline: 'Kinaaghang Notebook sa Tindahan ug Carinderia',
    navSell: 'Pabaligya',
    navProducts: 'Produkto/Putahe',
    navInventory: 'Karga/Stock',
    navToday: 'Halin Karon',
    
    newSale: 'Bag-ong baligya',
    todaysSales: 'Halin karon',
    stockRunningLow: 'Hapit na mahurot',
    amountReceived: 'Kwarta nga nadawat',
    change: 'Sukli',
    creditOwed: 'Utang',
    closeDay: 'Sirado ang adlaw',
    save: 'I-save',
    
    checkout: 'Badyet / Bayad',
    completeSale: 'I-save ang Halin',
    clearCart: 'I-karga Pag-usab',
    holdSale: 'I-pahuway Una',
    searchPlaceholder: 'Pangitaa ang baligya o putahe...',
    allCategories: 'Tanang Kategorya',
    favorites: 'Paborito',
    
    cash: 'Kwarta (Cash)',
    qrph: 'QR Ph (GCash/Maya/BDO)',
    creditUtang: 'Utang sa Suki',
    otherPayment: 'Uban Pa',
    
    pendingQR: 'Naghulat sa QR Bayad',
    merchantConfirmed: 'Nakasiguro na sa Cellphone',
    providerConfirmed: 'Kumpirmado sa Banko',
    paymentReceived: 'Nadawat na ang Bayad',
    refSuffix: 'Ref Number (Ulahing 4-6 Digit)',
    
    dailyMenu: 'Mga Putahe Karon',
    prepared: 'Gihanda nga Putahe',
    soldOut: 'Hurot Na',
    leftoverWaste: 'Sobra / NADAOT',
    recordWaste: 'I-rekord ang Nadaot',
    
    stockIn: 'Puno sa Karga (Stock-In)',
    adjustment: 'Pabag-o sa Karga',
    movementHistory: 'Agi sa Karga',
    reason: 'Rason (Karga, Kadaot, Isip)',
    
    sariSariStore: 'Tindahan (Sari-Sari)',
    carinderia: 'Karenderia / Kan-anan',
    mixedStore: 'Tindahan ug Karenderia',
    ownerPin: 'PIN sa Tag-iya',
    
    customerLedger: 'Lista sa Utang sa Suki',
    addCustomer: 'Pun-i og Bag-ong Suki',
    recordPayment: 'Dawat og Bayad sa Utang',
    currentBalance: 'Tanan nga Utang sa Suki',
    
    backupData: 'I-save ang Data (Backup JSON)',
    restoreData: 'I-uli ang Data gikan sa Backup',
    exportCSV: 'I-export sa Excel/CSV',
    
    taxDisclaimer: 'Pang-Internal nga Rekord Lamang — Dili opisyal nga BIR receipt',
    offlineIndicator: '100% Offline (Walay Internet)',
  },
  fil: {
    appName: 'TindaHalin',
    tagline: 'Benta at Imbentaryo sa Tindahan at Carinderia',
    navSell: 'Benta',
    navProducts: 'Produkto/Menu',
    navInventory: 'Imbentaryo',
    navToday: 'Benta Ngayon',
    
    newSale: 'Bagong benta',
    todaysSales: 'Benta ngayon',
    stockRunningLow: 'Paubos na',
    amountReceived: 'Natanggap na bayad',
    change: 'Sukli',
    creditOwed: 'Utang',
    closeDay: 'Isara ang araw',
    save: 'I-save',
    
    checkout: 'Magbayad',
    completeSale: 'Kumpirmahin ang Benta',
    clearCart: 'I-clear ang Cart',
    holdSale: 'I-hold ang Cart',
    searchPlaceholder: 'Maghanap ng produkto o ulam...',
    allCategories: 'Lahat ng Kategorya',
    favorites: 'Paborito',
    
    cash: 'Cash',
    qrph: 'QR Ph (GCash/Maya/BDO)',
    creditUtang: 'Utang ng Suki',
    otherPayment: 'Iba pa',
    
    pendingQR: 'Naghihintay ng QR Payment',
    merchantConfirmed: 'Kumpirmado ng Tindahan',
    providerConfirmed: 'Kumpirmado ng Bangko',
    paymentReceived: 'Natanggap na ang Bayad',
    refSuffix: 'Ref Number (Huling 4-6 Digit)',
    
    dailyMenu: 'Menu ng Carinderia Ngayon',
    prepared: 'Inihandang Putahe',
    soldOut: 'Ubost Na',
    leftoverWaste: 'Tira / Natapon',
    recordWaste: 'I-rekord ang Tira',
    
    stockIn: 'Magdagdag ng Stocks',
    adjustment: 'Baguhin ang Stocks',
    movementHistory: 'Kasaysayan ng Stocks',
    reason: 'Dahilan (Delivery, Sira, Bilang)',
    
    sariSariStore: 'Sari-Sari Store',
    carinderia: 'Carinderia / Kainitan',
    mixedStore: 'Tindahan at Carinderia',
    ownerPin: 'PIN ng May-ari',
    
    customerLedger: 'Talaan ng Utang ng Suki',
    addCustomer: 'Magdagdag ng Bagong Suki',
    recordPayment: 'Magtala ng Bayad sa Utang',
    currentBalance: 'Kabuuan ng Utang',
    
    backupData: 'Mag-backup ng Data (JSON)',
    restoreData: 'Ibalik ang Backup',
    exportCSV: 'I-export sa CSV',
    
    taxDisclaimer: 'Talaan ng Pamamahala Lamang — Hindi opisyal na resibo ng BIR',
    offlineIndicator: '100% Offline (Walang Internet Needed)',
  },
};
