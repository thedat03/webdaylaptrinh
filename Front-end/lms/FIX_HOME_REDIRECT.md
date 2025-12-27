# Tài liệu sửa lỗi: Trang Home tự động chuyển về đăng nhập

## Vấn đề
Khi mở trang Home (`/` hoặc `/home`), trang tự động chuyển hướng về trang đăng nhập (`/login`) ngay cả khi người dùng chưa đăng nhập.

## Nguyên nhân
1. **API Interceptor tự động redirect**: File `api.js` có interceptor xử lý response, khi nhận lỗi 401 (Unauthorized), nó tự động redirect về `/login`.
2. **Trang Home gọi các API public**: Trang Home gọi các API như:
   - `bannerService.getAllBanners()`
   - `categoryService.getAllCategories()`
   - `courseService.getAllCourses()`
   - `newsService.getFeaturedNews()`
   - `commentService.getFeaturedComments()`
   
   Nếu các API này trả về 401 (do backend yêu cầu authentication hoặc token không hợp lệ), interceptor sẽ redirect về login.

## Giải pháp đã áp dụng

### 1. Cập nhật API Interceptor (`src/api/api.js`)
- Thêm logic kiểm tra route public trước khi redirect
- Danh sách route public: `['/', '/home', '/public-home', '/login', '/register']`
- Nếu đang ở route public và nhận lỗi 401, không redirect về login

```javascript
// Danh sách các route public - không redirect về login khi ở các route này
const publicRoutes = ['/', '/home', '/public-home', '/login', '/register'];
const currentPath = window.location.pathname;
const isPublicRoute = publicRoutes.includes(currentPath);

if (error.response?.status === 401 && !skipRedirect && !isPublicRoute) {
    // Chỉ redirect khi không phải route public
    // ...
}
```

### 2. Thêm flag `skipAuthRedirect` cho các API public
Các service sau đã được cập nhật để thêm flag `skipAuthRedirect: true`:
- `banner.service.js` - `getAllBanners()`
- `category.service.js` - `getAllCategories()`
- `course.service.js` - `getAllCourses()`, `getCourseById()`
- `news.service.js` - `getFeaturedNews()`
- `comment.service.js` - `getFeaturedComments()`

```javascript
const { data } = await api.get("/api/banners", {
    skipAuthRedirect: true, // Public endpoint, không redirect khi 401
    metadata: { skipAuthRedirect: true }
});
```

## Files đã sửa

1. **Front-end/lms/src/api/api.js**
   - Thêm logic kiểm tra route public
   - Cập nhật interceptor để không redirect khi ở route public

2. **Front-end/lms/src/api/banner.service.js**
   - Thêm `skipAuthRedirect` cho `getAllBanners()`

3. **Front-end/lms/src/api/category.service.js**
   - Thêm `skipAuthRedirect` cho `getAllCategories()`

4. **Front-end/lms/src/api/course.service.js**
   - Thêm `skipAuthRedirect` cho `getAllCourses()` và `getCourseById()`

5. **Front-end/lms/src/api/news.service.js**
   - Thêm `skipAuthRedirect` cho `getFeaturedNews()`

6. **Front-end/lms/src/api/comment.service.js**
   - Thêm `skipAuthRedirect` cho `getFeaturedComments()`

## Kết quả
- Trang Home có thể truy cập được mà không cần đăng nhập
- Các API public không gây redirect về login khi trả về 401
- Các trang khác vẫn giữ nguyên logic redirect khi cần authentication

## Lưu ý
- Nếu thêm route public mới, cần cập nhật mảng `publicRoutes` trong `api.js`
- Các API endpoint public nên được đánh dấu bằng flag `skipAuthRedirect: true`
- Backend nên cho phép truy cập các endpoint public mà không yêu cầu authentication

