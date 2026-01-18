package com.rochanegra.api.vehicles;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(@RequestBody VehicleCreateDto createDto,
            Authentication authentication) {
        // The user's ID is the "principal's name" we set in the JWT filter
        UUID userId = UUID.fromString(authentication.getName());
        VehicleDto newVehicle = vehicleService.createVehicle(createDto, userId);
        return new ResponseEntity<>(newVehicle, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> getMyVehicles(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<VehicleDto> vehicles = vehicleService.getVehiclesForUser(userId);
        return ResponseEntity.ok(vehicles);
    }

    @PatchMapping("/{vehicleId}")
    public ResponseEntity<VehicleDto> updateVehicle(
            @PathVariable UUID vehicleId,
            @RequestBody VehicleCreateDto updateDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        VehicleDto updatedVehicle = vehicleService.updateVehicle(vehicleId, updateDto, userId);
        return ResponseEntity.ok(updatedVehicle);
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID vehicleId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        vehicleService.deleteVehicle(vehicleId, userId);
        return ResponseEntity.noContent().build();
    }

    // --- Global Log Endpoints (Must be above per-vehicle log endpoints) ---
    @GetMapping("/maintenance")
    public ResponseEntity<List<MaintenanceLogDto>> getAllMaintenanceLogs(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<MaintenanceLogDto> logs = vehicleService.getAllMaintenanceLogs(userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/fuel")
    public ResponseEntity<List<FuelLogDto>> getAllFuelLogs(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<FuelLogDto> logs = vehicleService.getAllFuelLogs(userId);
        return ResponseEntity.ok(logs);
    }

    // --- Per-Vehicle Log Endpoints ---
    @PostMapping("/{vehicleId}/maintenance")
    public ResponseEntity<MaintenanceLogDto> addMaintenanceLog(
            @PathVariable UUID vehicleId,
            @RequestBody MaintenanceLogCreateDto logDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        MaintenanceLogDto newLog = vehicleService.addMaintenanceLog(vehicleId, logDto, userId);
        return new ResponseEntity<>(newLog, HttpStatus.CREATED);
    }

    @GetMapping("/{vehicleId}/maintenance")
    public ResponseEntity<List<MaintenanceLogDto>> getMaintenanceLogs(
            @PathVariable UUID vehicleId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<MaintenanceLogDto> logs = vehicleService.getMaintenanceLogs(vehicleId, userId);
        return ResponseEntity.ok(logs);
    }

    @PatchMapping("/maintenance/{logId}")
    public ResponseEntity<MaintenanceLogDto> updateMaintenanceLog(
            @PathVariable UUID logId,
            @RequestBody MaintenanceLogCreateDto updateDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        MaintenanceLogDto updatedLog = vehicleService.updateMaintenanceLog(logId, updateDto, userId);
        return ResponseEntity.ok(updatedLog);
    }

    @DeleteMapping("/maintenance/{logId}")
    public ResponseEntity<Void> deleteMaintenanceLog(
            @PathVariable UUID logId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        vehicleService.deleteMaintenanceLog(logId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{vehicleId}/fuel")
    public ResponseEntity<FuelLogDto> addFuelLog(
            @PathVariable UUID vehicleId,
            @RequestBody FuelLogCreateDto logDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        FuelLogDto newLog = vehicleService.addFuelLog(vehicleId, logDto, userId);
        return new ResponseEntity<>(newLog, HttpStatus.CREATED);
    }

    @GetMapping("/{vehicleId}/fuel")
    public ResponseEntity<List<FuelLogDto>> getFuelLogs(
            @PathVariable UUID vehicleId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<FuelLogDto> logs = vehicleService.getFuelLogs(vehicleId, userId);
        return ResponseEntity.ok(logs);
    }

    @PatchMapping("/fuel/{logId}")
    public ResponseEntity<FuelLogDto> updateFuelLog(
            @PathVariable UUID logId,
            @RequestBody FuelLogCreateDto updateDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        FuelLogDto updatedLog = vehicleService.updateFuelLog(logId, updateDto, userId);
        return ResponseEntity.ok(updatedLog);
    }

    @DeleteMapping("/fuel/{logId}")
    public ResponseEntity<Void> deleteFuelLog(
            @PathVariable UUID logId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        vehicleService.deleteFuelLog(logId, userId);
        return ResponseEntity.noContent().build();
    }
}