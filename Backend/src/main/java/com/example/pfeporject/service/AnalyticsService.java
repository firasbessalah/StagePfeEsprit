package com.example.pfeporject.service;

import com.example.pfeporject.dto.DashboardAnalyticsDTO;
import com.example.pfeporject.dto.DashboardAnalyticsDTO.*;
import com.example.pfeporject.entity.Annonce;
import com.example.pfeporject.entity.Message;
import com.example.pfeporject.entity.Reservation;
import com.example.pfeporject.repository.AnnonceRepository;
import com.example.pfeporject.repository.MessageRepository;
import com.example.pfeporject.repository.ReservationRepository;
import com.example.pfeporject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepo;
    private final ReservationRepository reservationRepo;
    private final AnnonceRepository annonceRepo;
    private final MessageRepository messageRepo;

    public DashboardAnalyticsDTO getDashboardAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.toLocalDate().minusDays(7).atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime start12m = now.minusMonths(12);

        long totalUsers = userRepo.count();
        long totalReservations = reservationRepo.count();
        long totalAnnonces = annonceRepo.count();

        // ─── KPI: New this month ────────────────────────────
        long newUsersThisMonth = userRepo.countByCreatedAtAfter(startOfMonth);
        long reservationsThisMonth = reservationRepo.countByCreatedAtAfter(startOfMonth);
        long annoncesThisMonth = annonceRepo.countByCreatedAtAfter(startOfMonth);

        // ─── KPI: Users with reservations ───────────────────
        long usersWithReservations = reservationRepo.countDistinctUsers();
        double reservationUserPercentage = totalUsers > 0
                ? Math.round((double) usersWithReservations / totalUsers * 10000.0) / 100.0
                : 0.0;

        // ─── KPI: Users with annonces ───────────────────────
        long usersWithAnnonces = annonceRepo.countDistinctUsers();

        // ─── Active Users (DAU / WAU / MAU) ─────────────────
        long activeToday = countActiveUsers(startOfToday);
        long activeWeek = countActiveUsers(startOfWeek);
        long activeMonth = countActiveUsers(startOfMonth);

        // ─── Monthly New Users (last 12 months) ─────────────
        List<MonthlyCount> monthlyNewUsers = mapObjectRows(
                userRepo.countMonthlyRegistrations(start12m));

        // ─── Peak Usage Hours ───────────────────────────────
        int[] peakHours = computePeakHours();

        // ─── User Activity: 7d ──────────────────────────────
        List<DailyCount> activity7d = computeDailyActivity(7);

        // ─── User Activity: 30d ─────────────────────────────
        List<DailyCount> activity30d = computeDailyActivity(30);

        // ─── User Activity: 12m ─────────────────────────────
        List<MonthlyCount> activity12m = computeMonthlyActivity(12);

        // ─── Monthly Reservations ───────────────────────────
        List<MonthlyCount> monthlyReservations = mapObjectRows(
                reservationRepo.countMonthlyReservations(start12m));

        // ─── Monthly Annonces ───────────────────────────────
        List<MonthlyCount> monthlyAnnonces = mapObjectRows(
                annonceRepo.countMonthlyAnnonces(start12m));

        // ─── Monthly Comparisons ────────────────────────────
        LocalDateTime prevMonthStart = startOfMonth.minusMonths(1);
        LocalDateTime prevMonthEnd = startOfMonth;

        MonthlyComparison userComparison = buildComparison(
                userRepo.countByCreatedAtBetween(prevMonthStart, prevMonthEnd),
                newUsersThisMonth);
        MonthlyComparison reservationComparison = buildComparison(
                reservationRepo.countByCreatedAtBetween(prevMonthStart, prevMonthEnd),
                reservationsThisMonth);
        MonthlyComparison annonceComparison = buildComparison(
                annonceRepo.countByCreatedAtBetween(prevMonthStart, prevMonthEnd),
                annoncesThisMonth);

        // ─── Revenue & Commission ───────────────────────────────
        List<Reservation.StatutReservation> statutsRevenus = Arrays.asList(Reservation.StatutReservation.CONFIRMEE, Reservation.StatutReservation.TERMINEE);
        java.math.BigDecimal totalRevenue = reservationRepo.sumPrixTotalByStatutIn(statutsRevenus);
        if (totalRevenue == null) {
            totalRevenue = java.math.BigDecimal.ZERO;
        }
        java.math.BigDecimal totalCommission = totalRevenue.multiply(new java.math.BigDecimal("0.10"));

        // ─── Top 5 Annonces les plus recherchées ────────────────
        List<com.example.pfeporject.dto.AnnonceDTO> topAnnonces = annonceRepo.findTop5ByOrderByVuesDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // ─── Périodes de forte demande ──────────────────────────
        List<MonthlyCount> peakDemandPeriods = new ArrayList<>(monthlyReservations);
        peakDemandPeriods.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        if (peakDemandPeriods.size() > 3) {
            peakDemandPeriods = peakDemandPeriods.subList(0, 3);
        }

        return DashboardAnalyticsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsersToday(activeToday)
                .activeUsersWeek(activeWeek)
                .activeUsersMonth(activeMonth)
                .totalReservations(totalReservations)
                .usersWithReservations(usersWithReservations)
                .reservationUserPercentage(reservationUserPercentage)
                .totalAnnonces(totalAnnonces)
                .newUsersThisMonth(newUsersThisMonth)
                .reservationsThisMonth(reservationsThisMonth)
                .annoncesThisMonth(annoncesThisMonth)
                .monthlyNewUsers(monthlyNewUsers)
                .peakUsageHours(peakHours)
                .userActivity7d(activity7d)
                .userActivity30d(activity30d)
                .userActivity12m(activity12m)
                .monthlyReservations(monthlyReservations)
                .monthlyAnnonces(monthlyAnnonces)
                .usersWithAnnonces(usersWithAnnonces)
                .userComparison(userComparison)
                .reservationComparison(reservationComparison)
                .annonceComparison(annonceComparison)
                .totalRevenue(totalRevenue)
                .totalCommission(totalCommission)
                .topAnnonces(topAnnonces)
                .peakDemandPeriods(peakDemandPeriods)
                .build();
    }

    // ─── Mapper Annonce -> AnnonceDTO ───────────────────────
    private com.example.pfeporject.dto.AnnonceDTO toDTO(Annonce a) {
        com.example.pfeporject.dto.AnnonceDTO dto = new com.example.pfeporject.dto.AnnonceDTO();
        dto.setId(a.getId());
        dto.setTitre(a.getTitre());
        dto.setDescription(a.getDescription());
        dto.setPrix(a.getPrix());
        dto.setLocalisation(a.getLocalisation());
        dto.setLatitude(a.getLatitude());
        dto.setLongitude(a.getLongitude());
        dto.setDisponibiliteDebut(a.getDisponibiliteDebut());
        dto.setDisponibiliteFin(a.getDisponibiliteFin());
        dto.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
        dto.setCreatedAt(a.getCreatedAt());
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserNom(a.getUser().getNom());
            dto.setUserPrenom(a.getUser().getPrenom());
        }
        dto.setCategorie(a.getCategorie() != null ? a.getCategorie().name() : null);
        dto.setDuree(a.getDuree());
        dto.setVues(a.getVues());
        return dto;
    }

    // ─── Helpers ────────────────────────────────────────────

    /**
     * Count unique users who performed any activity (reservation, annonce, message)
     * since the given cutoff.
     */
    private long countActiveUsers(LocalDateTime since) {
        Set<Long> activeUserIds = new HashSet<>();

        reservationRepo.findByCreatedAtAfter(since)
                .forEach(r -> { if (r.getUser() != null) activeUserIds.add(r.getUser().getId()); });

        annonceRepo.findByCreatedAtAfter(since)
                .forEach(a -> { if (a.getUser() != null) activeUserIds.add(a.getUser().getId()); });

        messageRepo.findByCreatedAtAfter(since)
                .forEach(m -> {
                    if (m.getExpediteur() != null) activeUserIds.add(m.getExpediteur().getId());
                });

        return activeUserIds.size();
    }

    /**
     * Build a 24-element array counting activity timestamps by hour of day.
     */
    private int[] computePeakHours() {
        int[] hours = new int[24];
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(3);

        reservationRepo.findByCreatedAtAfter(cutoff)
                .forEach(r -> { if (r.getCreatedAt() != null) hours[r.getCreatedAt().getHour()]++; });
        annonceRepo.findByCreatedAtAfter(cutoff)
                .forEach(a -> { if (a.getCreatedAt() != null) hours[a.getCreatedAt().getHour()]++; });
        messageRepo.findByCreatedAtAfter(cutoff)
                .forEach(m -> { if (m.getCreatedAt() != null) hours[m.getCreatedAt().getHour()]++; });

        return hours;
    }

    /**
     * Compute daily active user counts for the last N days.
     */
    private List<DailyCount> computeDailyActivity(int days) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        List<DailyCount> result = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

            Set<Long> ids = new HashSet<>();
            reservationRepo.findByCreatedAtAfter(dayStart).stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isBefore(dayEnd))
                    .forEach(r -> { if (r.getUser() != null) ids.add(r.getUser().getId()); });
            annonceRepo.findByCreatedAtAfter(dayStart).stream()
                    .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isBefore(dayEnd))
                    .forEach(a -> { if (a.getUser() != null) ids.add(a.getUser().getId()); });
            messageRepo.findByCreatedAtAfter(dayStart).stream()
                    .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isBefore(dayEnd))
                    .forEach(m -> { if (m.getExpediteur() != null) ids.add(m.getExpediteur().getId()); });

            result.add(new DailyCount(date.format(fmt), ids.size()));
        }
        return result;
    }

    /**
     * Compute monthly active user counts for the last N months.
     */
    private List<MonthlyCount> computeMonthlyActivity(int months) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        List<MonthlyCount> result = new ArrayList<>();

        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate nextMonth = monthStart.plusMonths(1);
            LocalDateTime start = monthStart.atStartOfDay();
            LocalDateTime end = nextMonth.atStartOfDay();

            Set<Long> ids = new HashSet<>();
            reservationRepo.findByCreatedAtAfter(start).stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isBefore(end))
                    .forEach(r -> { if (r.getUser() != null) ids.add(r.getUser().getId()); });
            annonceRepo.findByCreatedAtAfter(start).stream()
                    .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isBefore(end))
                    .forEach(a -> { if (a.getUser() != null) ids.add(a.getUser().getId()); });
            messageRepo.findByCreatedAtAfter(start).stream()
                    .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isBefore(end))
                    .forEach(m -> { if (m.getExpediteur() != null) ids.add(m.getExpediteur().getId()); });

            result.add(new MonthlyCount(monthStart.format(fmt), ids.size()));
        }
        return result;
    }

    private List<MonthlyCount> mapObjectRows(List<Object[]> rows) {
        return rows.stream()
                .map(r -> new MonthlyCount((String) r[0], ((Number) r[1]).longValue()))
                .collect(Collectors.toList());
    }

    private MonthlyComparison buildComparison(long previous, long current) {
        double pct = previous > 0
                ? Math.round((double) (current - previous) / previous * 10000.0) / 100.0
                : (current > 0 ? 100.0 : 0.0);
        String trend = current > previous ? "up" : (current < previous ? "down" : "flat");
        return new MonthlyComparison(current, previous, pct, trend);
    }
}
