# 4.2 Thiết kế chi tiết

## 4.2.1 Thiết kế giao diện

Phần này cung cấp thông tin chi tiết về thiết kế giao diện cho hệ thống quản lý học tập trực tuyến (LMS), bao gồm độ phân giải màn hình, kích thước màn hình, số lượng màu sắc hỗ trợ, và các chuẩn hóa thiết kế giao diện.

Ứng dụng web được thiết kế để tương thích với nhiều loại thiết bị có kích thước và độ phân giải màn hình khác nhau, đảm bảo trải nghiệm người dùng tốt trên mọi thiết bị.

### Bảng 4.1: Bảng mô tả thông tin màn hình

| STT | Thiết bị | Kích thước | Độ phân giải |
|-----|----------|------------|--------------|
| 1 | Máy tính để bàn, laptop | 11-13 inch, 14 inch, 15.6 inch, trên 21 inch | HD (1366x768) px<br>Full HD (1920x1080 px)<br>2K (2560x1440 px)<br>4K (3840x2160 px) |
| 2 | Máy tính bảng | Từ 7 đến 12 inch | HD (1280x720 px)<br>Full HD (1920x1080 px)<br>2K (2560x1440 px) |
| 3 | Smart Phone | Từ 5.8 inch đến 8 inch | HD (1280x720 px)<br>Full HD (1920x1080 px)<br>2K (2560x1440 px) |

**Số lượng màu sắc hỗ trợ**: 16.7 triệu màu (True Color - 24-bit)

**Công nghệ sử dụng**: 
- Framework: React 19.1.1
- CSS Framework: Tailwind CSS 4.1.16
- UI Component Library: Ant Design 5.28.0
- Responsive Design: Mobile-first approach với breakpoints của Tailwind CSS

---

## Chuẩn hóa thiết kế giao diện

Để đảm bảo giao diện người dùng thân thiện và nhất quán, chúng tôi tuân thủ các chuẩn hóa sau khi thiết kế giao diện:

### Thiết kế nút bấm (Buttons)

**Bảng 4.2: Chuẩn hóa thiết kế nút bấm**

| Thuộc tính | Mô tả |
|------------|-------|
| **Kích thước** | Tối thiểu 44x44 pixels (theo chuẩn accessibility)<br>Nút chính: padding 12-16px (px-4 py-2.5 đến px-6 py-4)<br>Nút phụ: padding 8-12px (px-3 py-2) |
| **Màu sắc** | **Nút chính**: Gradient từ xanh dương (#2563eb) đến tím (#7c3aed)<br>**Nút chính (solid)**: Xanh dương (#2563eb - indigo-600)<br>**Nút phụ**: Xám (#6c757d) hoặc trắng với viền<br>**Nút cảnh báo**: Đỏ (#ef4444 - accent color)<br>**Hover**: Màu đậm hơn (dark variant) |
| **Hình dạng** | Bo tròn góc (border-radius: 8px - 12px)<br>rounded-lg (8px) hoặc rounded-xl (12px) |
| **Phản hồi** | Thay đổi màu sắc khi hover (hover:bg-indigo-700)<br>Hiệu ứng shadow khi hover (shadow-sm → shadow-md)<br>Transform nhẹ khi hover (hover:-translate-y-0.5)<br>Transition mượt mà (transition-all duration-200) |
| **Trạng thái** | Disabled: Màu xám (#9ca3af), cursor-not-allowed<br>Loading: Hiển thị spinner animation |

**Ví dụ mã CSS/Tailwind:**
- Nút chính: `bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg px-4 py-2.5 font-semibold shadow-sm hover:shadow-md transition-all`
- Nút gradient: `bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700`

---

### Điều khiển (Controls)

**Bảng 4.3: Chuẩn hóa thiết kế điều khiển**

| Loại điều khiển | Thuộc tính | Mô tả |
|-----------------|------------|-------|
| **Textbox/Input fields** | Kích thước | Tối thiểu 150x40 pixels<br>Padding: px-3 py-3 (12px vertical, 12px horizontal) |
| | Viền | Màu xám nhạt (#d1d5db - border-gray-300)<br>Bo góc nhẹ: rounded-lg (8px)<br>Focus: Viền xanh dương (#2563eb) với ring-2 |
| | Placeholder | Màu xám nhạt (#9ca3af - text-gray-300) |
| | Focus state | Ring màu xanh dương (focus:ring-2 focus:ring-blue-500)<br>Viền xanh dương (focus:border-blue-500) |
| **Dropdowns và Selects** | Kích thước | Tối thiểu 150x40 pixels<br>Sử dụng component Ant Design Select |
| | Viền | Màu xám (#d1d5db)<br>Bo góc: rounded-lg |
| | Styling | Tích hợp với Ant Design theme |
| **Checkboxes và Radio buttons** | Kích thước | 20x20 pixels (mặc định Ant Design) |
| | Màu sắc | Viền xám, màu xanh dương khi được chọn<br>Sử dụng component Ant Design |
| **Icons** | Kích thước | 16px, 20px, 24px (h-4 w-4, h-5 w-5, h-6 w-6)<br>Font Awesome và Lucide React |
| | Màu sắc | Theo context (xanh dương cho primary, xám cho secondary) |

**Ví dụ Input Field Component:**
```jsx
className="flex-1 block w-full px-3 py-3 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
text-gray-900 placeholder-gray-300"
```

---

### Vị trí hiển thị thông điệp phản hồi (Feedback Messages)

**Bảng 4.4: Vị trí và màu sắc thông điệp phản hồi**

| Loại thông báo | Vị trí hiển thị | Màu sắc | Component |
|----------------|-----------------|---------|-----------|
| **Thông báo thành công** | Phía trên cùng màn hình (top-center)<br>Hoặc dưới các trường nhập liệu | Xanh lá cây (#28a745)<br>Nền: #f0fdf4 (green-50)<br>Viền: #86efac (green-200) | Ant Design message.success() |
| **Thông báo lỗi** | Phía trên cùng màn hình (top-center)<br>Hoặc dưới các trường nhập liệu | Đỏ (#dc3545 hoặc #ef4444)<br>Nền: #fef2f2 (red-50)<br>Viền: #fecaca (red-200) | Ant Design message.error() |
| **Thông báo cảnh báo** | Phía trên cùng màn hình (top-center) | Vàng (#facc15 hoặc #ffc107)<br>Nền: #fffbeb (yellow-50) | Ant Design message.warning() |
| **Thông báo thông tin** | Phía trên cùng màn hình (top-center) | Xanh dương (#17a2b8 hoặc #2563eb)<br>Nền: #eff6ff (blue-50) | Ant Design message.info() |

**Ví dụ hiển thị thông báo lỗi trong form:**
```jsx
{error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-1">
        <p className="text-red-800 text-sm font-medium">{error}</p>
    </div>
)}
```

**Thời gian hiển thị**: 
- Thông báo tự động: 3 giây (mặc định Ant Design)
- Có thể đóng thủ công bằng nút X

---

### Phối màu (Color Scheme)

**Bảng 4.5: Phối màu cho giao diện**

| Thành phần | Màu sắc | Mã màu | Sử dụng |
|------------|---------|--------|---------|
| **Màu nền chính** | Trắng | #ffffff | Nền trang, card, modal |
| **Màu nền phụ** | Xám rất nhạt | #f9fafb (gray-50) | Nền section, background |
| **Màu chữ chính** | Đen/Xám đậm | #000000 / #1f2937 (gray-800) | Tiêu đề, nội dung chính |
| **Màu chữ phụ** | Xám nhạt | #6b7280 (gray-500) / #9ca3af (gray-400) | Text phụ, placeholder |
| **Màu nhấn (Primary)** | Xanh dương | #2563eb (indigo-600) | Nút chính, link, icon quan trọng |
| **Màu nhấn (Primary Dark)** | Xanh dương đậm | #1d4ed8 (indigo-700) | Hover state cho primary |
| **Màu phụ (Secondary)** | Tím | #7c3aed (purple-600) | Nút phụ, accent elements |
| **Màu phụ (Secondary Dark)** | Tím đậm | #6d28d9 (purple-700) | Hover state cho secondary |
| **Màu cảnh báo (Accent)** | Đỏ | #ef4444 (red-500) | Nút xóa, cảnh báo |
| **Màu cảnh báo (Accent Dark)** | Đỏ đậm | #dc2626 (red-600) | Hover state cho accent |
| **Màu cảnh báo nhẹ (Warning)** | Vàng | #facc15 (yellow-400) | Thông báo cảnh báo |
| **Màu phản hồi thành công** | Xanh lá cây | #28a745 (green-500) | Thông báo thành công, trạng thái tích cực |
| **Màu phản hồi lỗi** | Đỏ | #dc3545 (red-600) | Thông báo lỗi, trạng thái tiêu cực |
| **Màu phản hồi cảnh báo** | Vàng | #ffc107 (yellow-500) | Thông báo cảnh báo |
| **Màu phản hồi thông tin** | Xanh dương nhạt | #17a2b8 (cyan-500) | Thông báo thông tin |
| **Gradient chính** | Gradient xanh-tím | linear-gradient(to right, #2563eb, #7c3aed) | Nút đặc biệt, banner |

---

### Typography (Kiểu chữ)

**Bảng 4.6: Chuẩn hóa kiểu chữ**

| Thuộc tính | Mô tả |
|------------|-------|
| **Font chính** | Poppins (Google Fonts) - Sans-serif<br>Font phụ: Montserrat (Google Fonts) |
| **Kích thước** | H1: text-4xl (36px) - Tiêu đề lớn<br>H2: text-3xl (30px) - Tiêu đề section<br>H3: text-2xl (24px) - Tiêu đề phụ<br>H4: text-xl (20px) - Tiêu đề nhỏ<br>Body: text-base (16px) - Nội dung chính<br>Small: text-sm (14px) - Text phụ<br>XSmall: text-xs (12px) - Chú thích |
| **Độ đậm** | Light: 300<br>Regular: 400<br>Medium: 500<br>Semibold: 600<br>Bold: 700 |
| **Line height** | 1.5 (mặc định) cho body text<br>1.2-1.3 cho tiêu đề |

---

### Spacing và Layout

**Bảng 4.7: Chuẩn hóa khoảng cách**

| Thuộc tính | Giá trị | Sử dụng |
|------------|---------|---------|
| **Container max-width** | max-w-7xl (1280px) | Container chính |
| **Padding section** | py-8 đến py-16 (32px - 64px) | Khoảng cách giữa các section |
| **Gap giữa elements** | gap-3 đến gap-6 (12px - 24px) | Khoảng cách giữa các phần tử |
| **Border radius** | rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px) | Bo góc cho card, button |

---

### Animation và Transition

**Bảng 4.8: Chuẩn hóa hiệu ứng**

| Thuộc tính | Mô tả |
|------------|-------|
| **Transition** | transition-all duration-200 (0.2s) | Chuyển đổi mượt mà cho các tương tác |
| **Hover effects** | Transform nhẹ (hover:-translate-y-0.5)<br>Shadow tăng (shadow-sm → shadow-md) |
| **Animation** | fadeInUp: 0.8s ease-out<br>fadeIn: 0.5s ease-in-out | Hiệu ứng xuất hiện |
| **Loading spinner** | Spin animation với SVG | Trạng thái loading |

---

### Responsive Design

**Bảng 4.9: Breakpoints và Responsive**

| Breakpoint | Kích thước | Sử dụng |
|------------|------------|---------|
| **Mobile** | < 768px | Thiết kế mobile-first |
| **Tablet (md:)** | ≥ 768px | Ẩn/hiện menu mobile, điều chỉnh layout |
| **Desktop (lg:)** | ≥ 1024px | Layout đầy đủ, sidebar |
| **Large Desktop (xl:)** | ≥ 1280px | Container max-width |

**Chiến lược**: Mobile-first approach - thiết kế cho mobile trước, sau đó mở rộng cho màn hình lớn hơn.

---

### Component Libraries

- **Ant Design 5.28.0**: Sử dụng cho các component phức tạp như Select, DatePicker, Modal, Message, Table
- **Font Awesome**: Icons (free-solid-svg-icons, free-brands-svg-icons)
- **Lucide React**: Icons hiện đại, nhẹ
- **Tailwind CSS**: Utility-first CSS framework cho styling

---

### Hình ảnh minh họa thiết kế giao diện

*(Lưu ý: Sinh viên cần chèn các hình ảnh screenshot của các màn hình quan trọng vào đây, bao gồm:)*

1. **Màn hình trang chủ (Home)**: Hiển thị banner, danh sách khóa học nổi bật, danh mục
2. **Màn hình đăng nhập/Đăng ký**: Form với input fields, buttons, validation messages
3. **Màn hình danh sách khóa học**: Grid layout, filter, search
4. **Màn hình chi tiết khóa học**: Thông tin khóa học, video player, danh sách bài học
5. **Màn hình học tập (Lesson Viewer)**: Video player, nội dung bài học, code editor
6. **Màn hình Dashboard (Giáo viên/Admin)**: Bảng thống kê, biểu đồ, quản lý khóa học
7. **Màn hình Profile**: Thông tin người dùng, tiến độ học tập

*(Mỗi hình ảnh cần có chú thích rõ ràng về các thành phần UI được sử dụng)*

---

### Lưu ý quan trọng

1. **Không nhầm lẫn**: Tài liệu này mô tả **thiết kế giao diện** (design specifications), không phải giao diện của sản phẩm sau cùng. Đây là các quy tắc và chuẩn hóa được áp dụng trong quá trình phát triển.

2. **Tính nhất quán**: Tất cả các màn hình và component phải tuân thủ các chuẩn hóa trên để đảm bảo trải nghiệm người dùng nhất quán.

3. **Accessibility**: Thiết kế tuân thủ các nguyên tắc accessibility cơ bản:
   - Kích thước nút tối thiểu 44x44px
   - Tỷ lệ tương phản màu sắc đủ
   - Focus states rõ ràng
   - Semantic HTML

4. **Performance**: 
   - Sử dụng lazy loading cho images
   - Code splitting cho các route
   - Optimize animations để không ảnh hưởng performance

---

*Tài liệu này được tạo dựa trên phân tích codebase của dự án LMS tại thư mục Front-end/lms/*
