package com.example.pfeporject.controller;

import com.example.pfeporject.dto.DashboardAnalyticsDTO;
import com.example.pfeporject.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/analytics/dashboard
     * Returns all dashboard analytics data in a single response.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsDTO> getDashboardAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }

    /**
     * GET /api/analytics/export/excel
     * Generates and returns the dashboard analytics as an Excel file.
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportDashboardExcel() {
        try {
            DashboardAnalyticsDTO data = analyticsService.getDashboardAnalytics();
            com.example.pfeporject.service.ExportService exportService = new com.example.pfeporject.service.ExportService();
            byte[] excelContent = exportService.generateDashboardExcel(data);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard_analytics.xlsx");
            headers.set(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(excelContent, headers, org.springframework.http.HttpStatus.OK);
        } catch (java.io.IOException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
