package com.example.webdaylaptrinh.config;

import com.example.webdaylaptrinh.security.jwt.JwtAuthTokenFilter;
import com.example.webdaylaptrinh.security.jwt.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@Slf4j
public class WebSecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthTokenFilter jwtAuthTokenFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .exceptionHandling(eh -> eh.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(sm -> sm.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/payments/vnpay-return", "/api/payments/vnpay-ipn").permitAll()

                        // Courses
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/banners/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/files/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/banners/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/banners/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/banners/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/promotions/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/promotions/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/promotions/**").hasRole("ADMIN")
                        .requestMatchers("/api/statistics/**").hasRole("ADMIN")

                        // Assessments, Enrollments, Feedback, Learning, Progress
                        .requestMatchers(HttpMethod.POST, "/api/payments").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/payments/user/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/payments").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/payments/instructor/**").hasRole("INSTRUCTOR")

                        .requestMatchers("/api/enrollments/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers("/api/learning/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers("/api/progress/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")

                        // Code execution endpoints - require authentication
                        .requestMatchers("/api/code/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")

                        // Code exercises - instructors manage, students can view and run
                        .requestMatchers(HttpMethod.GET, "/api/code-exercises/**").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/code-exercises").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/code-exercises/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/code-exercises/**").hasRole("INSTRUCTOR")

                        // Exams - giáo viên tạo/quản lý, học viên làm bài
                        .requestMatchers(HttpMethod.GET, "/api/courses/*/exams/published").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses/*/exams/owner").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/exams").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/exams/*/questions").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/exams/questions/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/exams/questions/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/exams/*/submissions/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/exams/*/questions/*/run").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/exams/*/submit").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/exams/*/my-submission").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")

                        // Comments - GET public, POST/PUT/DELETE authenticated
                        // TA endpoints - đặt trước pattern tổng quát
                        .requestMatchers(HttpMethod.GET, "/api/comments/unanswered").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/comments/lesson/*/ta").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/comments/course/*/ta").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/comments/*/ta-answer").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/comments/*/ta-hide").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/comments/*/ta-unhide").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/*/ta-delete").hasRole("TEACHING_ASSISTANT")
                        // Public GET endpoints
                        .requestMatchers(HttpMethod.GET, "/api/comments/lesson/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/course/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/*/replies").permitAll()
                        // Authenticated POST/PUT/DELETE
                        .requestMatchers(HttpMethod.POST, "/api/comments").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/comments/*").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/*").hasAnyRole("USER", "STUDENT", "ADMIN", "INSTRUCTOR", "TEACHING_ASSISTANT")

                        // Direct Questions - Hỏi trực tiếp
                        .requestMatchers(HttpMethod.POST, "/api/direct-questions").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/direct-questions/my-questions").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/direct-questions/*/convert-to-comment").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/direct-questions/*/mark-resolved").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/direct-questions/ta/my-assigned").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/direct-questions/pending").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/direct-questions/*/answer").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.POST, "/api/direct-questions/*/claim").hasRole("TEACHING_ASSISTANT")

                        // TA Reminders - Nhắc nhở
                        .requestMatchers(HttpMethod.POST, "/api/ta-reminders").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/ta-reminders/ta/my-reminders").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/ta-reminders/my-reminders").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/ta-reminders/*/read").hasAnyRole("USER", "STUDENT", "TEACHING_ASSISTANT")

                        // TA Progress - Theo dõi tiến độ
                        .requestMatchers(HttpMethod.GET, "/api/ta-progress/**").hasRole("TEACHING_ASSISTANT")
                        .requestMatchers(HttpMethod.GET, "/api/ta-progress/assigned-courses").hasRole("TEACHING_ASSISTANT")

                        // Admin - Quản lý phân công TA
                        .requestMatchers("/api/admin/ta-assignments/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "192.160.16.100"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
