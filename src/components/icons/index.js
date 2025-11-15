// Mapeamento de ícones MUI para Font Awesome via CDN
// Facilita a migração substituindo imports
// Font Awesome já está carregado via CDN no index.html

import FontAwesomeIcon from './FontAwesomeIcon';

// Helper para criar componentes de ícone compatíveis com MUI
// Usa Font Awesome via CDN diretamente
export const createIcon = (faIcon, variant = 'solid') => {
  return (props) => <FontAwesomeIcon icon={faIcon} variant={variant} {...props} />;
};

// Ícones comuns mapeados
export const MenuIcon = createIcon('bars');
export const ChevronLeftIcon = createIcon('chevron-left');
export const ChevronRightIcon = createIcon('chevron-right');
export const CloseIcon = createIcon('times');
export const EditIcon = createIcon('edit');
export const DeleteIcon = createIcon('trash');
export const AddIcon = createIcon('plus');
export const RemoveIcon = createIcon('minus');
export const SearchIcon = createIcon('search');
export const CheckCircleIcon = createIcon('check-circle');
export const CancelIcon = createIcon('times-circle');
export const MoreVertIcon = createIcon('ellipsis-v');
export const ContentCopyIcon = createIcon('copy');
export const StoreIcon = createIcon('store');
export const StorefrontIcon = createIcon('store-alt');
export const ShoppingCartIcon = createIcon('shopping-cart');
export const LocalShippingIcon = createIcon('truck');
export const PaymentIcon = createIcon('credit-card');
export const PersonIcon = createIcon('user');
export const LocationOnIcon = createIcon('map-marker-alt');
export const WhatsAppIcon = createIcon('whatsapp', 'brands');
export const QrCode2Icon = createIcon('qrcode');
export const TrendingUpIcon = createIcon('chart-line');
export const AttachMoneyIcon = createIcon('dollar-sign');
export const RestaurantIcon = createIcon('utensils');
export const LockOutlinedIcon = createIcon('lock');
export const PhotoCameraIcon = createIcon('camera');
export const NavigateBeforeIcon = createIcon('chevron-left');
export const DeleteOutlineIcon = createIcon('trash-alt');
export const KeyboardArrowDownIcon = createIcon('chevron-down');
export const AccessTimeIcon = createIcon('clock');
export const InfoIcon = createIcon('info-circle');
export const CategoryIcon = createIcon('th-large');
export const VisibilityIcon = createIcon('eye');
export const RefreshIcon = createIcon('sync');
export const SmartphoneIcon = createIcon('mobile-alt');
export const ComputerIcon = createIcon('desktop');
export const TabletIcon = createIcon('tablet-alt');
export const OpenInNewIcon = createIcon('external-link-alt');
export const ListIcon = createIcon('list');
export const MapIcon = createIcon('map');
export const PeopleIcon = createIcon('users');
export const LanguageIcon = createIcon('language');
export const PublicIcon = createIcon('globe');
export const GetAppIcon = createIcon('download');
export const CheckCircleIconOutline = createIcon('check-circle', 'regular');
export const PhoneAndroidIcon = createIcon('mobile-alt');
export const DesktopWindowsIcon = createIcon('desktop');
export const EmailIcon = createIcon('envelope');
export const ArrowBackIcon = createIcon('arrow-left');

// Exportar o componente base também
export { FontAwesomeIcon };
export default FontAwesomeIcon;

