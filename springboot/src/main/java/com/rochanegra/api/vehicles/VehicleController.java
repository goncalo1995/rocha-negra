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

    // NOTE: You would add GET (by ID), PATCH, and DELETE endpoints for vehicles
    // here following the same pattern.

    // --- Log Endpoints ---
    @PostMapping("/{vehicleId}/maintenance")
    public ResponseEntity<MaintenanceLogDto> addMaintenanceLog(
            @PathVariable UUID vehicleId,
            @RequestBody MaintenanceLogCreateDto logDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        MaintenanceLogDto newLog = vehicleService.addMaintenanceLog(vehicleId, logDto, userId);
        return new ResponseEntity<>(newLog, HttpStatus.CREATED);
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

}