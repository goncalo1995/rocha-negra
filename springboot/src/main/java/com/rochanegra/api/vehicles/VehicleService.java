package com.rochanegra.api.vehicles;

import com.rochanegra.api.finance.transactions.TransactionCreateDto;
import com.rochanegra.api.finance.transactions.TransactionService;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.finance.recurring.RecurringRuleCreateDto;
import com.rochanegra.api.finance.recurring.RecurringRuleService;
import com.rochanegra.api.finance.recurring.RecurringFrequency;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final FuelLogRepository fuelLogRepository;

    private final TransactionService transactionService;
    private final RecurringRuleService recurringRuleService;

    @Transactional
    public VehicleDto createVehicle(VehicleCreateDto createDto, UUID userId) {
        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(userId);
        vehicle.setName(createDto.name());
        vehicle.setMake(createDto.make());
        vehicle.setModel(createDto.model());
        vehicle.setYear(createDto.year());
        vehicle.setVin(createDto.vin());
        vehicle.setLicensePlate(createDto.licensePlate());
        vehicle.setFuelType(createDto.fuelType());
        vehicle.setCurrentMileage(createDto.currentMileage());
        vehicle.setMileageUnit(createDto.mileageUnit());
        vehicle.setFuelUnit(createDto.fuelUnit());
        vehicle.setInsuranceProvider(createDto.insuranceProvider());
        vehicle.setInsurancePolicyNumber(createDto.insurancePolicyNumber());
        vehicle.setInsuranceExpirationDate(createDto.insuranceExpirationDate());
        vehicle.setInsuranceYearlyCost(createDto.insuranceYearlyCost());
        vehicle.setInsuranceRenewalDate(createDto.insuranceRenewalDate());
        vehicle.setNotes(createDto.notes());

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

        // Add inspection recurring rule (annual) if year is provided or insurance info
        // exists
        if (savedVehicle.getYear() != null || createDto.insuranceRenewalDate() != null) {
            LocalDate inspectionDate = createDto.insuranceRenewalDate() != null
                    ? createDto.insuranceRenewalDate().plusMonths(6)
                    : LocalDate.now().plusYears(1);

            RecurringRuleCreateDto inspectionRuleDto = new RecurringRuleCreateDto(
                    "Inspection: " + savedVehicle.getName(),
                    BigDecimal.ZERO,
                    RecurringFrequency.yearly,
                    inspectionDate,
                    null,
                    null);
            recurringRuleService.createRecurringRule(inspectionRuleDto, userId);
        }

        return toDto(savedVehicle);
    }

    public List<VehicleDto> getVehiclesForUser(UUID userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Vehicle findVehicleByIdAndUser(UUID vehicleId, UUID userId) {
        return vehicleRepository.findById(vehicleId)
                .filter(vehicle -> vehicle.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Transactional
    public MaintenanceLogDto addMaintenanceLog(UUID vehicleId, MaintenanceLogCreateDto logDto, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        MaintenanceLog newLog = new MaintenanceLog();
        newLog.setUserId(userId);
        newLog.setVehicleId(vehicleId);
        newLog.setType(logDto.type());
        newLog.setDescription(logDto.description());
        newLog.setCost(logDto.cost());
        newLog.setDate(logDto.date());
        newLog.setMileageAtService(logDto.mileageAtService());
        newLog.setCurrency(logDto.currency());
        newLog.setServiceProvider(logDto.serviceProvider());
        newLog.setNotes(logDto.notes());

        MaintenanceLog savedLog = maintenanceLogRepository.save(newLog);

        // Update vehicle mileage if it's higher
        if (logDto.mileageAtService() != null
                && (vehicle.getCurrentMileage() == null || logDto.mileageAtService() > vehicle.getCurrentMileage())) {
            vehicle.setCurrentMileage(Double.valueOf(logDto.mileageAtService()));
            vehicleRepository.save(vehicle);
        }

        // Create transaction only if syncToFinance is true
        if (Boolean.TRUE.equals(logDto.syncToFinance())) {
            TransactionCreateDto transactionDto = new TransactionCreateDto(
                    logDto.cost().negate(),
                    "Maintenance (" + logDto.type() + "): " + vehicle.getName(),
                    logDto.date(),
                    TransactionType.expense,
                    null, // TODO: Link to a "Vehicle Maintenance" category ID
                    logDto.assetId() // Link to chosen asset
            );
            transactionService.createTransaction(transactionDto, userId);
        }

        return toDto(savedLog);
    }

    @Transactional
    public FuelLogDto addFuelLog(UUID vehicleId, FuelLogCreateDto logDto, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        FuelLog newLog = new FuelLog();
        newLog.setUserId(userId);
        newLog.setVehicleId(vehicleId);
        newLog.setQuantity(logDto.quantity());
        newLog.setQuantityUnit(logDto.quantityUnit());
        newLog.setPricePerUnit(logDto.pricePerUnit());
        newLog.setTotalCost(logDto.totalCost());
        newLog.setCurrency(logDto.currency());
        newLog.setMileageAtFill(logDto.mileageAtFill());
        newLog.setFullTank(logDto.fullTank());
        newLog.setStation(logDto.station());
        newLog.setNotes(logDto.notes());
        newLog.setDate(logDto.date());
        // Fill redundant fields for DB consistency
        BigDecimal quantity = logDto.quantity() != null ? logDto.quantity() : BigDecimal.ZERO;
        BigDecimal normalizedQuantity;

        switch (logDto.quantityUnit().toLowerCase()) {
            case "gallons": // default to US for backwards compat
            case "gallons_us":
                normalizedQuantity = quantity.multiply(new BigDecimal("3.78541"));
                break;
            case "gallons_uk":
                normalizedQuantity = quantity.multiply(new BigDecimal("4.54609"));
                break;
            case "liters":
            default:
                normalizedQuantity = quantity;
                break;
        }
        newLog.setNormalizedQuantityLiters(normalizedQuantity.setScale(3, java.math.RoundingMode.HALF_UP));

        double normalizedMileage = logDto.mileageAtFill() != null ? logDto.mileageAtFill().doubleValue() : 0.0;
        if ("mi".equalsIgnoreCase(vehicle.getMileageUnit())) {
            normalizedMileage = normalizedMileage * 1.60934;
        }
        newLog.setNormalizedMileageKm(normalizedMileage);

        FuelLog savedLog = fuelLogRepository.save(newLog);

        // Update vehicle mileage if it's higher
        if (logDto.mileageAtFill() != null
                && (vehicle.getCurrentMileage() == null || logDto.mileageAtFill() > vehicle.getCurrentMileage())) {
            vehicle.setCurrentMileage(Double.valueOf(logDto.mileageAtFill()));
            vehicleRepository.save(vehicle);
        }

        // Create transaction only if syncToFinance is true
        if (Boolean.TRUE.equals(logDto.syncToFinance())) {
            TransactionCreateDto transactionDto = new TransactionCreateDto(
                    logDto.totalCost().negate(),
                    "Fuel: " + vehicle.getName(),
                    logDto.date(),
                    TransactionType.expense,
                    null,
                    logDto.assetId() // Link to chosen asset
            );
            transactionService.createTransaction(transactionDto, userId);
        }

        return toDto(savedLog);
    }

    @Transactional
    public VehicleDto updateVehicle(UUID vehicleId, VehicleCreateDto updateDto, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        if (updateDto.name() != null)
            vehicle.setName(updateDto.name());
        if (updateDto.make() != null)
            vehicle.setMake(updateDto.make());
        if (updateDto.model() != null)
            vehicle.setModel(updateDto.model());
        if (updateDto.year() != null)
            vehicle.setYear(updateDto.year());
        if (updateDto.vin() != null)
            vehicle.setVin(updateDto.vin());
        if (updateDto.licensePlate() != null)
            vehicle.setLicensePlate(updateDto.licensePlate());
        if (updateDto.fuelType() != null)
            vehicle.setFuelType(updateDto.fuelType());
        if (updateDto.currentMileage() != null)
            vehicle.setCurrentMileage(updateDto.currentMileage());
        if (updateDto.mileageUnit() != null)
            vehicle.setMileageUnit(updateDto.mileageUnit());
        if (updateDto.fuelUnit() != null)
            vehicle.setFuelUnit(updateDto.fuelUnit());
        if (updateDto.insuranceProvider() != null)
            vehicle.setInsuranceProvider(updateDto.insuranceProvider());
        if (updateDto.insurancePolicyNumber() != null)
            vehicle.setInsurancePolicyNumber(updateDto.insurancePolicyNumber());
        if (updateDto.insuranceExpirationDate() != null)
            vehicle.setInsuranceExpirationDate(updateDto.insuranceExpirationDate());
        if (updateDto.insuranceYearlyCost() != null)
            vehicle.setInsuranceYearlyCost(updateDto.insuranceYearlyCost());
        if (updateDto.insuranceRenewalDate() != null)
            vehicle.setInsuranceRenewalDate(updateDto.insuranceRenewalDate());
        if (updateDto.notes() != null)
            vehicle.setNotes(updateDto.notes());

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return toDto(savedVehicle);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId, UUID userId) {
        Vehicle vehicle = findVehicleByIdAndUser(vehicleId, userId);

        // Delete related logs first
        maintenanceLogRepository.deleteByVehicleId(vehicleId);
        fuelLogRepository.deleteByVehicleId(vehicleId);

        vehicleRepository.delete(vehicle);
    }

    public List<MaintenanceLogDto> getMaintenanceLogs(UUID vehicleId, UUID userId) {
        findVehicleByIdAndUser(vehicleId, userId); // Verify ownership
        return maintenanceLogRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceLogDto> getAllMaintenanceLogs(UUID userId) {
        return maintenanceLogRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMaintenanceLog(UUID logId, UUID userId) {
        MaintenanceLog log = maintenanceLogRepository.findById(logId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Log not found"));
        maintenanceLogRepository.delete(log);
    }

    @Transactional
    public MaintenanceLogDto updateMaintenanceLog(UUID logId, MaintenanceLogCreateDto updateDto, UUID userId) {
        MaintenanceLog log = maintenanceLogRepository.findById(logId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (updateDto.type() != null)
            log.setType(updateDto.type());
        if (updateDto.description() != null)
            log.setDescription(updateDto.description());
        if (updateDto.cost() != null)
            log.setCost(updateDto.cost());
        if (updateDto.date() != null)
            log.setDate(updateDto.date());
        if (updateDto.mileageAtService() != null)
            log.setMileageAtService(updateDto.mileageAtService());
        if (updateDto.currency() != null)
            log.setCurrency(updateDto.currency());
        if (updateDto.serviceProvider() != null)
            log.setServiceProvider(updateDto.serviceProvider());
        if (updateDto.notes() != null)
            log.setNotes(updateDto.notes());

        return toDto(maintenanceLogRepository.save(log));
    }

    public List<FuelLogDto> getFuelLogs(UUID vehicleId, UUID userId) {
        findVehicleByIdAndUser(vehicleId, userId); // Verify ownership
        return fuelLogRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<FuelLogDto> getAllFuelLogs(UUID userId) {
        return fuelLogRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFuelLog(UUID logId, UUID userId) {
        FuelLog log = fuelLogRepository.findById(logId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Log not found"));
        fuelLogRepository.delete(log);
    }

    @Transactional
    public FuelLogDto updateFuelLog(UUID logId, FuelLogCreateDto updateDto, UUID userId) {
        FuelLog log = fuelLogRepository.findById(logId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (updateDto.quantity() != null)
            log.setQuantity(updateDto.quantity());
        if (updateDto.quantityUnit() != null)
            log.setQuantityUnit(updateDto.quantityUnit());
        if (updateDto.pricePerUnit() != null)
            log.setPricePerUnit(updateDto.pricePerUnit());
        if (updateDto.totalCost() != null)
            log.setTotalCost(updateDto.totalCost());
        if (updateDto.currency() != null)
            log.setCurrency(updateDto.currency());
        if (updateDto.mileageAtFill() != null)
            log.setMileageAtFill(updateDto.mileageAtFill());
        if (updateDto.fullTank() != null)
            log.setFullTank(updateDto.fullTank());
        if (updateDto.station() != null)
            log.setStation(updateDto.station());
        if (updateDto.notes() != null)
            log.setNotes(updateDto.notes());
        if (updateDto.date() != null)
            log.setDate(updateDto.date());

        // Re-calculate normalization
        BigDecimal quantity = log.getQuantity() != null ? log.getQuantity() : BigDecimal.ZERO;
        BigDecimal normalizedQuantity;
        switch (log.getQuantityUnit().toLowerCase()) {
            case "gallons":
            case "gallons_us":
                normalizedQuantity = quantity.multiply(new BigDecimal("3.78541"));
                break;
            case "gallons_uk":
                normalizedQuantity = quantity.multiply(new BigDecimal("4.54609"));
                break;
            default:
                normalizedQuantity = quantity;
                break;
        }
        log.setNormalizedQuantityLiters(normalizedQuantity.setScale(3, java.math.RoundingMode.HALF_UP));

        double normalizedMileage = log.getMileageAtFill() != null ? log.getMileageAtFill().doubleValue() : 0.0;
        Vehicle vehicle = vehicleRepository.findById(log.getVehicleId()).orElse(null);
        if (vehicle != null && "mi".equalsIgnoreCase(vehicle.getMileageUnit())) {
            normalizedMileage = normalizedMileage * 1.60934;
        }
        log.setNormalizedMileageKm(normalizedMileage);

        return toDto(fuelLogRepository.save(log));
    }

    private VehicleDto toDto(Vehicle vehicle) {
        return new VehicleDto(
                vehicle.getId(),
                vehicle.getName(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getVin(),
                vehicle.getLicensePlate(),
                vehicle.getFuelType(),
                vehicle.getCurrentMileage(),
                vehicle.getMileageUnit(),
                vehicle.getFuelUnit(),
                vehicle.getInsuranceProvider(),
                vehicle.getInsurancePolicyNumber(),
                vehicle.getInsuranceExpirationDate(),
                vehicle.getInsuranceYearlyCost(),
                vehicle.getInsuranceRenewalDate(),
                vehicle.getNotes(),
                vehicle.getCreatedAt());
    }

    private MaintenanceLogDto toDto(MaintenanceLog log) {
        return new MaintenanceLogDto(
                log.getId(),
                log.getVehicleId(),
                log.getType(),
                log.getDescription(),
                log.getMileageAtService(),
                log.getCost(),
                log.getCurrency(),
                log.getServiceProvider(),
                log.getNotes(),
                log.getDate());
    }

    private FuelLogDto toDto(FuelLog log) {
        return new FuelLogDto(
                log.getId(),
                log.getVehicleId(),
                log.getQuantity(),
                log.getQuantityUnit(),
                log.getPricePerUnit(),
                log.getTotalCost(),
                log.getCurrency(),
                log.getMileageAtFill(),
                log.getFullTank(),
                log.getStation(),
                log.getNotes(),
                log.getDate(),
                log.getNormalizedQuantityLiters(),
                log.getNormalizedMileageKm());
    }
}