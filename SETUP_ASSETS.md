# Hướng dẫn cài đặt Assets cho Trang chủ

Trang chủ Vue.js hiện đang sử dụng placeholder images từ Unsplash. Để có giao diện đẹp hơn và giống với template Medion gốc, bạn có thể copy assets từ FE_QLTiemThuoc.

## Cách 1: Copy Assets từ FE_QLTiemThuoc (Khuyến nghị)

### Bước 1: Tạo thư mục assets_user

```bash
mkdir public\assets_user
```

### Bước 2: Copy các thư mục từ FE_QLTiemThuoc

Copy các thư mục sau từ `FE_QLTiemThuoc\wwwroot\assets_user\` sang `tiemthuoc_fe\public\assets_user\`:

- `css/` - Các file CSS của template Medion
- `img/` - Hình ảnh (hero, products, banners, icons, etc.)
- `js/` - JavaScript plugins (Owl Carousel, CountDown, etc.)
- `fonts/` - Web fonts

**Lệnh PowerShell:**

```powershell
# Từ thư mục GiaoDien_Test
Copy-Item -Path "FE_QLTiemThuoc\wwwroot\assets_user\*" -Destination "tiemthuoc_fe\public\assets_user\" -Recurse -Force
```

### Bước 3: Cập nhật đường dẫn hình ảnh trong home.vue

Sau khi copy xong assets, cập nhật file `src/views/home.vue`:

```javascript
// Thay thế dòng này:
const heroImg = ref('https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1920&h=600&fit=crop')
const heroProductImg = ref('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop')

// Thành:
const heroImg = ref('/assets_user/img/hero/bg.png')
const heroProductImg = ref('/assets_user/img/hero/hero-1.png')
```

Và trong hàm `getProductImage`:

```javascript
const getProductImage = (product) => {
  const urlAnh = product.urlAnh || product.UrlAnh || 'default.png'
  if (urlAnh.startsWith('http://') || urlAnh.startsWith('https://') || urlAnh.startsWith('/')) {
    return urlAnh
  }
  return `/assets_user/img/product/${urlAnh}`
}
```

## Cách 2: Sử dụng CDN hoặc Images Online

Nếu không muốn copy assets, bạn có thể:

1. **Upload hình ảnh lên cloud storage** (Cloudinary, ImgBB, etc.)
2. **Sử dụng placeholder từ Unsplash** (như hiện tại)
3. **Tạo hình ảnh tùy chỉnh** và đặt trong `public/assets_user/img/`

## Cấu trúc Assets sau khi copy

```
tiemthuoc_fe/
├── public/
│   ├── assets_user/
│   │   ├── css/
│   │   │   ├── bootstrap.min.css
│   │   │   ├── all.min.css
│   │   │   ├── owl.carousel.min.css
│   │   │   └── style.css
│   │   ├── img/
│   │   │   ├── hero/
│   │   │   │   ├── bg.png
│   │   │   │   └── hero-1.png
│   │   │   ├── product/
│   │   │   │   └── [product images]
│   │   │   ├── category/
│   │   │   ├── banner/
│   │   │   └── ...
│   │   ├── js/
│   │   │   ├── jquery.min.js
│   │   │   ├── owl.carousel.min.js
│   │   │   └── ...
│   │   └── fonts/
```

## Thêm CSS Template (Tùy chọn)

Nếu muốn sử dụng CSS gốc của template Medion thay vì custom CSS trong home.vue:

1. Copy file CSS từ `assets_user/css/style.css`
2. Import vào `index.html`:

```html
<link rel="stylesheet" href="/assets_user/css/bootstrap.min.css">
<link rel="stylesheet" href="/assets_user/css/all.min.css">
<link rel="stylesheet" href="/assets_user/css/style.css">
```

## Lưu ý

- Trang chủ hiện tại đã responsive và hoạt động tốt với placeholder images
- Assets từ FE_QLTiemThuoc có dung lượng khá lớn (~50MB)
- Nếu không cần tất cả assets, chỉ copy thư mục `img/hero/` và `img/product/` là đủ
- Backend API cần trả về đúng URL hình ảnh trong field `urlAnh` hoặc `UrlAnh`

## Test sau khi setup

Sau khi copy assets xong, chạy lại dev server:

```bash
npm run dev
```

Truy cập: http://localhost:5173/user để xem trang chủ mới!
