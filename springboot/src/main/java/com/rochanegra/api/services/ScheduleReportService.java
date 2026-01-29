package com.rochanegra.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ScheduleReportService {
    @Autowired
    private FileOSService fileOSService;

    @Autowired
    private EmailService emailService;

    private List<String> emailList = Arrays.asList("cerejagoncalo@gmail.com");

    private final long SEVEN_DAYS_IN_MILISECONDS = 604800000;

    @Scheduled(fixedRate = 30000)
    public void sendReport() {
        try {
            // String report = fileOSService.getReportFileContent("report.html");

            for (String email : emailList) {
                System.out.println("Sending report to " + email);
                emailService.sendReport("testing new email", email);
                System.out.println("Report sent");
            }
        } catch (Exception e) {
            System.out.println("Error sending report");
            e.printStackTrace();
        }
    }
}