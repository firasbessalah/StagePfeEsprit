package com.example.pfeporject.service;

import com.example.pfeporject.dto.DashboardAnalyticsDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ExportService {

    public byte[] generateDashboardExcel(DashboardAnalyticsDTO data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            
            // ─── Sheet 1: KPIs ────────────────────────────────
            Sheet kpiSheet = workbook.createSheet("KPIs");
            int rowNum = 0;
            Row headerRow = kpiSheet.createRow(rowNum++);
            headerRow.createCell(0).setCellValue("Métrique");
            headerRow.createCell(1).setCellValue("Valeur");

            addKpiRow(kpiSheet, rowNum++, "Total Utilisateurs", String.valueOf(data.getTotalUsers()));
            addKpiRow(kpiSheet, rowNum++, "Total Réservations", String.valueOf(data.getTotalReservations()));
            addKpiRow(kpiSheet, rowNum++, "Total Annonces", String.valueOf(data.getTotalAnnonces()));
            addKpiRow(kpiSheet, rowNum++, "Revenus Totaux (DT)", String.valueOf(data.getTotalRevenue()));
            addKpiRow(kpiSheet, rowNum++, "Commission Totale (DT)", String.valueOf(data.getTotalCommission()));

            // ─── Sheet 2: Périodes de forte demande ───────────
            Sheet peakSheet = workbook.createSheet("Périodes de forte demande");
            int peakRow = 0;
            Row peakHeader = peakSheet.createRow(peakRow++);
            peakHeader.createCell(0).setCellValue("Mois");
            peakHeader.createCell(1).setCellValue("Nombre de réservations");

            if (data.getPeakDemandPeriods() != null) {
                for (DashboardAnalyticsDTO.MonthlyCount mc : data.getPeakDemandPeriods()) {
                    Row r = peakSheet.createRow(peakRow++);
                    r.createCell(0).setCellValue(mc.getLabel());
                    r.createCell(1).setCellValue(mc.getCount());
                }
            }

            // ─── Sheet 3: Top Logements ───────────────────────
            Sheet topSheet = workbook.createSheet("Top 5 Logements Recherchés");
            int topRow = 0;
            Row topHeader = topSheet.createRow(topRow++);
            topHeader.createCell(0).setCellValue("Titre");
            topHeader.createCell(1).setCellValue("Localisation");
            topHeader.createCell(2).setCellValue("Prix (DT)");
            topHeader.createCell(3).setCellValue("Vues");

            if (data.getTopAnnonces() != null) {
                for (com.example.pfeporject.dto.AnnonceDTO a : data.getTopAnnonces()) {
                    Row r = topSheet.createRow(topRow++);
                    r.createCell(0).setCellValue(a.getTitre());
                    r.createCell(1).setCellValue(a.getLocalisation());
                    if (a.getPrix() != null) r.createCell(2).setCellValue(a.getPrix().doubleValue());
                    if (a.getVues() != null) r.createCell(3).setCellValue(a.getVues());
                }
            }

            // Autosize columns
            kpiSheet.autoSizeColumn(0);
            kpiSheet.autoSizeColumn(1);
            peakSheet.autoSizeColumn(0);
            peakSheet.autoSizeColumn(1);
            topSheet.autoSizeColumn(0);
            topSheet.autoSizeColumn(1);
            topSheet.autoSizeColumn(2);
            topSheet.autoSizeColumn(3);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void addKpiRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }
}
