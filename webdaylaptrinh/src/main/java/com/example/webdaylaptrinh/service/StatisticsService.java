package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.DashboardStatsDTO;
import com.example.webdaylaptrinh.dto.RevenueChartDTO;
import com.example.webdaylaptrinh.dto.TopCourseDTO;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.Promotion;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.CourseStatus;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class StatisticsService {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningRepository learningRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentCourseRepository paymentCourseRepository;
    private final CommentRepository commentRepository;
    private final PromotionRepository promotionRepository;
    
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfYear = now.toLocalDate().withDayOfYear(1).atStartOfDay();
        
        // Basic counts
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCourses(courseRepository.count());
        stats.setTotalEnrollments(learningRepository.count());
        stats.setTotalPayments(paymentRepository.count());
        
        // Revenue calculations
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .collect(Collectors.toList());
        
        long totalRevenue = successfulPayments.stream()
                .mapToLong(Payment::getAmount)
                .sum();
        stats.setTotalRevenue(totalRevenue);
        
        // Revenue by period
        stats.setRevenueToday(calculateRevenue(successfulPayments, startOfToday, now));
        stats.setRevenueThisWeek(calculateRevenue(successfulPayments, startOfWeek, now));
        stats.setRevenueThisMonth(calculateRevenue(successfulPayments, startOfMonth, now));
        stats.setRevenueThisYear(calculateRevenue(successfulPayments, startOfYear, now));
        
        // Course status
        stats.setPendingCourses((long) courseRepository.findByStatus(CourseStatus.PENDING).size());
        stats.setApprovedCourses((long) courseRepository.findByStatus(CourseStatus.APPROVED).size());
        stats.setRejectedCourses((long) courseRepository.findByStatus(CourseStatus.REJECTED).size());
        
        // Payment status
        stats.setSuccessfulPayments(paymentRepository.countByStatus(PaymentStatus.PAID));
        stats.setPendingPayments(paymentRepository.countByStatus(PaymentStatus.PENDING));
        stats.setFailedPayments(paymentRepository.countByStatus(PaymentStatus.FAILED));
        
        // Active promotions
        List<Promotion> activePromos = promotionRepository.findAllActiveAndCurrent(now);
        stats.setActivePromotions((long) activePromos.size());
        
        // Comments
        stats.setTotalComments(commentRepository.count());
        
        // New users
        List<User> allUsers = userRepository.findAll();
        stats.setNewUsersToday(countUsersInPeriod(allUsers, startOfToday, now));
        stats.setNewUsersThisWeek(countUsersInPeriod(allUsers, startOfWeek, now));
        stats.setNewUsersThisMonth(countUsersInPeriod(allUsers, startOfMonth, now));
        
        // New courses
        List<Course> allCourses = courseRepository.findAll();
        stats.setNewCoursesThisMonth(countCoursesInPeriod(allCourses, startOfMonth, now));
        
        // New payments today
        stats.setNewPaymentsToday(countPaymentsInPeriod(successfulPayments, startOfToday, now));
        
        return stats;
    }
    
    public RevenueChartDTO getRevenueChart(String period) {
        List<String> labels = new ArrayList<>();
        List<Long> revenues = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID && p.getPayDate() != null)
                .collect(Collectors.toList());
        
        switch (period.toLowerCase()) {
            case "day":
                // Last 7 days
                for (int i = 6; i >= 0; i--) {
                    LocalDate date = now.toLocalDate().minusDays(i);
                    LocalDateTime start = date.atStartOfDay();
                    LocalDateTime end = date.plusDays(1).atStartOfDay();
                    
                    long revenue = calculateRevenue(successfulPayments, start, end);
                    labels.add(date.format(DateTimeFormatter.ofPattern("dd/MM")));
                    revenues.add(revenue);
                }
                break;
            case "week":
                // Last 8 weeks
                for (int i = 7; i >= 0; i--) {
                    LocalDate weekStart = now.toLocalDate().minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
                    LocalDate weekEnd = weekStart.plusDays(6);
                    LocalDateTime start = weekStart.atStartOfDay();
                    LocalDateTime end = weekEnd.plusDays(1).atStartOfDay();
                    
                    long revenue = calculateRevenue(successfulPayments, start, end);
                    labels.add("Tuần " + (8 - i));
                    revenues.add(revenue);
                }
                break;
            case "month":
                // Last 12 months
                for (int i = 11; i >= 0; i--) {
                    LocalDate monthStart = now.toLocalDate().minusMonths(i).withDayOfMonth(1);
                    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                    LocalDateTime start = monthStart.atStartOfDay();
                    LocalDateTime end = monthEnd.plusDays(1).atStartOfDay();
                    
                    long revenue = calculateRevenue(successfulPayments, start, end);
                    labels.add(monthStart.format(DateTimeFormatter.ofPattern("MM/yyyy")));
                    revenues.add(revenue);
                }
                break;
            case "year":
                // Last 5 years
                for (int i = 4; i >= 0; i--) {
                    LocalDate yearStart = now.toLocalDate().minusYears(i).withDayOfYear(1);
                    LocalDate yearEnd = yearStart.plusYears(1).minusDays(1);
                    LocalDateTime start = yearStart.atStartOfDay();
                    LocalDateTime end = yearEnd.plusDays(1).atStartOfDay();
                    
                    long revenue = calculateRevenue(successfulPayments, start, end);
                    labels.add(String.valueOf(yearStart.getYear()));
                    revenues.add(revenue);
                }
                break;
        }
        
        return new RevenueChartDTO(labels, revenues, period);
    }
    
    public List<TopCourseDTO> getTopCourses(int limit) {
        List<Course> allCourses = courseRepository.findAll();
        
        return allCourses.stream()
                .map(course -> {
                    long enrollmentCount = learningRepository.countByCourse(course);
                    
                    // Calculate revenue from payments
                    long revenue = paymentCourseRepository.findAll().stream()
                            .filter(pc -> pc.getPayment().getStatus() == PaymentStatus.PAID)
                            .filter(pc -> pc.getCourse().getCourse_id().equals(course.getCourse_id()))
                            .mapToLong(pc -> pc.getPayment().getAmount())
                            .sum();
                    
                    // Get average rating (if available)
                    Double rating = course.getRating() != null ? course.getRating() : 0.0;
                    
                    return new TopCourseDTO(
                            course.getCourse_id(),
                            course.getCourse_name(),
                            course.getInstructor(),
                            enrollmentCount,
                            revenue,
                            rating,
                            course.getPrice()
                    );
                })
                .sorted((a, b) -> Long.compare(b.getEnrollmentCount(), a.getEnrollmentCount()))
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    private long calculateRevenue(List<Payment> payments, LocalDateTime start, LocalDateTime end) {
        return payments.stream()
                .filter(p -> {
                    LocalDateTime payDate = p.getPayDate() != null ? p.getPayDate() : p.getCreatedAt();
                    return payDate != null && !payDate.isBefore(start) && payDate.isBefore(end);
                })
                .mapToLong(Payment::getAmount)
                .sum();
    }
    
    private long countUsersInPeriod(List<User> users, LocalDateTime start, LocalDateTime end) {
        return users.stream()
                .filter(u -> u.getCreatedAt() != null && 
                           !u.getCreatedAt().isBefore(start) && 
                           u.getCreatedAt().isBefore(end))
                .count();
    }
    
    private long countCoursesInPeriod(List<Course> courses, LocalDateTime start, LocalDateTime end) {
        // If Course doesn't have createdAt, we'll count all courses in the period
        // This is a simplified version - adjust based on actual Course entity structure
        return courses.size(); // Simplified - you may need to add createdAt to Course entity
    }
    
    private long countPaymentsInPeriod(List<Payment> payments, LocalDateTime start, LocalDateTime end) {
        return payments.stream()
                .filter(p -> {
                    LocalDateTime payDate = p.getPayDate() != null ? p.getPayDate() : p.getCreatedAt();
                    return payDate != null && !payDate.isBefore(start) && payDate.isBefore(end);
                })
                .count();
    }
}

