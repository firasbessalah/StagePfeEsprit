package com.example.pfeporject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDTO {

    // ─── KPI Cards ──────────────────────────────────────────
    private long totalUsers;
    private long activeUsersToday;
    private long activeUsersWeek;
    private long activeUsersMonth;
    private long totalReservations;
    private long usersWithReservations;
    private double reservationUserPercentage;
    private long totalAnnonces;
    private long newUsersThisMonth;
    private long reservationsThisMonth;
    private long annoncesThisMonth;
    
    // ─── Revenues & Top Annonces ────────────────────────────
    private java.math.BigDecimal totalRevenue;
    private java.math.BigDecimal totalCommission;
    private List<com.example.pfeporject.dto.AnnonceDTO> topAnnonces;
    private List<MonthlyCount> peakDemandPeriods;

    // ─── Charts ─────────────────────────────────────────────
    private List<MonthlyCount> monthlyNewUsers;
    private int[] peakUsageHours;                    // 24 entries [0..23]
    private List<DailyCount> userActivity7d;
    private List<DailyCount> userActivity30d;
    private List<MonthlyCount> userActivity12m;
    private List<MonthlyCount> monthlyReservations;
    private List<MonthlyCount> monthlyAnnonces;
    private long usersWithAnnonces;

    // ─── Monthly Comparisons ────────────────────────────────
    private MonthlyComparison userComparison;
    private MonthlyComparison reservationComparison;
    private MonthlyComparison annonceComparison;

    // ─── Nested Types ───────────────────────────────────────

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyCount {
        private String label;   // e.g. "2025-01", "Jan 2025"
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyCount {
        private String label;   // e.g. "2025-07-20"
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyComparison {
        private long currentMonth;
        private long previousMonth;
        private double percentageChange;   // positive = increase, negative = decrease
        private String trend;              // "up" or "down" or "flat"
    }
}
