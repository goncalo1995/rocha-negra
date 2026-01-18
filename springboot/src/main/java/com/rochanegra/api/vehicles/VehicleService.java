package com.rochanegra.api.vehicles;

import com.rochanegra.api.finance.TransactionCreateDto;
import com.rochanegra.api.finance.TransactionService;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.finance.RecurringRuleCreateDto;
import com.rochanegra.api.finance.RecurringRuleService;
import com.rochanegra.api.finance.RecurringFrequency;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final FuelLogRepository fuelLogRepository;

    // Service for cross-module communication
    private final TransactionService transactionService;
    private final RecurringRuleService recurringRuleService;

    public VehicleDto createVehicle(VehicleCreateDto createDto, UUID userId) {
        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(userId);
        vehicle.setName(createDto.name());
        vehicle.setMake(createDto.make());
        vehicle.setModel(createDto.model());
        vehicle.setYear(createDto.year());
        vehicle.setVin(createDto.vin());
        vehicle.setLicensePlate(createDto.licensePlate());

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // If insurance info is provided, create a recurring rule
        if (createDto.insuranceYearlyCost() != null && createDto.insuranceRenewalDate() != null) {
            RecurringRuleCreateDto ruleDto = new RecurringRuleCreateDto(
                    "Insurance: " + savedVehicle.getName(),
                    createDto.insuranceYearlyCost().negate(), // Insurance is an expense
                    RecurringFrequency.yearly,
                    createDto.insuranceRenewalDate(),
                    null, // TODO: Link to an "Insurance" category ID
                    null // TODO: Link to the asset used for payment
            );
            recurringRuleService.createRecurringRule(ruleDto, userId);
        }

        return toDto(savedVehicle);
    }

    public List<VehicleDto> getVehiclesForUser(UUID userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // --- We need to fetch the Vehicle Entity to get its name ---
    public Vehicle findVehicleByIdAndUser(UUID vehicleId, UUID userId) {
        return vehicleRepository.findById(vehicleId)
                .filter(vehicle -> vehicle.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Vehicle not found")); // Or a custom exception
    }

    // --- UPDATED METHOD ---
    @Transactional // Make this an "all or nothing" operation
    public MaintenanceLogDto addMaintenanceLog(UUID vehicleId, MaintenanceLogCreateDto logDto, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        // 1. Create and save the new MaintenanceLog entity
        MaintenanceLog newLog = new MaintenanceLog();
        newLog.setUserId(userId);
        newLog.setVehicleId(vehicleId);
        newLog.setDescription(logDto.description());
        newLog.setCost(logDto.cost());
        newLog.setDate(logDto.date());
        newLog.setOdometer(logDto.odometer());
        MaintenanceLog savedLog = maintenanceLogRepository.save(newLog);

        // 2. Create the corresponding financial transaction
        TransactionCreateDto transactionDto = new TransactionCreateDto(
                logDto.cost().negate(), // Use .negate() for expenses
                "Maintenance: " + vehicle.getName(),
                logDto.date(),
                TransactionType.expense,
                null, // TODO: Link to a "Vehicle Maintenance" category ID
                null // TODO: Link to the asset (bank account) used for payment
        );
        transactionService.createTransaction(transactionDto, userId);

        // return savedLog; // Return the saved maintenance log
        return toDto(savedLog); // Return the DTO of the created log
        // return new MaintenanceLog(); // Placeholder until we build the entity
    }

    // --- UPDATED METHOD ---
    @Transactional
    public FuelLogDto addFuelLog(UUID vehicleId, FuelLogCreateDto logDto, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        // 1. Create and save the new FuelLog entity
        FuelLog newLog = new FuelLog();
        newLog.setUserId(userId);
        newLog.setVehicleId(vehicleId);
        newLog.setGallons(logDto.gallons());
        newLog.setTotalCost(logDto.totalCost());
        newLog.setOdometer(logDto.odometer());
        newLog.setDate(logDto.date());
        FuelLog savedLog = fuelLogRepository.save(newLog);

        // 2. Create the corresponding financial transaction
        TransactionCreateDto transactionDto = new TransactionCreateDto(
                logDto.totalCost().negate(), // Use .negate() for expenses
                "Fuel: " + vehicle.getName(),
                logDto.date(),
                TransactionType.expense,
                null, // TODO: Link to a "Fuel" category ID
                null // TODO: Link to the asset (bank account) used for payment
        );
        transactionService.createTransaction(transactionDto, userId);

        return toDto(savedLog); // Return the DTO of the created log
    }

    // Mapper method to convert Entity to DTO
    private VehicleDto toDto(Vehicle vehicle) {
        return new VehicleDto(
                vehicle.getId(),
                vehicle.getName(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getVin(),
                vehicle.getLicensePlate(),
                vehicle.getCreatedAt());
    }

    private MaintenanceLogDto toDto(MaintenanceLog log) {
        return new MaintenanceLogDto(
                log.getId(),
                log.getVehicleId(),
                log.getDescription(),
                log.getCost(),
                log.getDate(),
                log.getOdometer());
    }

    private FuelLogDto toDto(FuelLog log) {
        return new FuelLogDto(
                log.getId(),
                log.getVehicleId(),
                log.getGallons(),
                log.getTotalCost(),
                log.getOdometer(),
                log.getDate());
    }
}