package com.rochanegra.api.vehicles;

import com.rochanegra.api.finance.transactions.TransactionCreateDto;
import com.rochanegra.api.finance.transactions.TransactionService;
import com.rochanegra.api.finance.types.AssetType;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.links.EntityLinkDto;
import com.rochanegra.api.finance.recurring.RecurringRuleCreateDto;
import com.rochanegra.api.finance.recurring.RecurringRuleService;
import com.rochanegra.api.finance.assets.AssetCreateDto;
import com.rochanegra.api.finance.assets.AssetDto;
import com.rochanegra.api.finance.assets.AssetService;
import com.rochanegra.api.finance.categories.Category;
import com.rochanegra.api.finance.categories.CategoryService;
import com.rochanegra.api.finance.recurring.RecurringFrequency;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final AssetService assetService;
    private final CategoryService categoryService;

    @Transactional
    public VehicleDto createVehicle(VehicleCreateDto createDto, UUID userId) {
        // Step 1: Create the financial Asset for the vehicle
        AssetCreateDto assetDto = new AssetCreateDto(
                createDto.name(),
                AssetType.vehicle,
                createDto.currency() != null ? createDto.currency() : "EUR",
                createDto.initialValue(),
                null,
                "Make: " + createDto.make() + ", Model: " + createDto.model(),
                null);
        AssetDto savedAsset = assetService.createAsset(assetDto, userId);

        // Step 2: Create the Vehicle entity, linking to the asset
        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(userId);
        vehicle.setAssetId(savedAsset.id());
        vehicle.setName(createDto.name());
        vehicle.setMake(createDto.make());
        vehicle.setModel(createDto.model());
        vehicle.setYear(createDto.year());
        vehicle.setVin(createDto.vin());
        vehicle.setLicensePlate(createDto.licensePlate());
        vehicle.setFuelType(createDto.fuelType());
        vehicle.setCurrentMileage(createDto.currentMileage());
        vehicle.setMileageUnit(createDto.mileageUnit());
        vehicle.setInsuranceProvider(createDto.insuranceProvider());
        vehicle.setInsurancePolicyNumber(createDto.insurancePolicyNumber());
        vehicle.setNotes(createDto.notes());

        if (createDto.fuelUnit() == null || createDto.fuelUnit().isBlank()) {
            vehicle.setFuelUnit("liters");
        } else {
            vehicle.setFuelUnit(createDto.fuelUnit());
        }

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Step 3: Create associated recurring rules (This logic is now clean)
        // Note: It's better UI/UX for the user to add these manually after creation.
        // But if you must automate, this is how.
        if (createDto.insuranceYearlyCost() != null &&
                createDto.insuranceRenewalDate() != null) {
            RecurringRuleCreateDto ruleDto = new RecurringRuleCreateDto(
                    "Insurance: " + savedVehicle.getName(),
                    RecurringFrequency.yearly,
                    createDto.insuranceRenewalDate(),
                    null, // endDate
                    createDto.insuranceYearlyCost().negate(), // amount
                    createDto.currency(),
                    TransactionType.expense,
                    null, // categoryId
                    null, // destinationAssetId
                    createDto.assetId(), // The asset to pay FROM
                    null // Custom fields
            );
            recurringRuleService.createRule(ruleDto, userId);
        }

        // Removed automatic inspection rule - this is better handled by the user in the
        // UI.

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
            TransactionCreateDto transactionDto = buildMaintenanceTransactionDto(logDto, vehicle, userId);
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
        newLog.setNormalizedQuantityLiters(normalizedQuantity.setScale(3,
                java.math.RoundingMode.HALF_UP));

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
            TransactionCreateDto transactionDto = buildFuelTransactionDto(logDto, vehicle, userId);
            transactionService.createTransaction(transactionDto, userId);
        }

        return toDto(savedLog);
    }

    // --- NEW PRIVATE "BUILDER" HELPER METHODS ---

    private TransactionCreateDto buildMaintenanceTransactionDto(MaintenanceLogCreateDto logDto, Vehicle vehicle,
            UUID userId) {
        if (logDto.assetId() == null) {
            throw new IllegalArgumentException("assetId is required when syncing maintenance log to finance.");
        }

        // Find the default "Car Maintenance" category
        UUID maintenanceCategoryId = categoryService.findCategoryBySystemKey(userId, "CAT_CAR_MAINTENANCE")
                .map(Category::getId)
                .orElse(null);

        // Create the link to the vehicle
        List<EntityLinkDto> links = List.of(
                new EntityLinkDto(vehicle.getId(), "vehicle"));

        return new TransactionCreateDto(
                logDto.cost().negate(), // amountOriginal
                logDto.currency(),
                "Maintenance (" + logDto.type() + "): " + vehicle.getName(), // description
                logDto.date(),
                TransactionType.expense,
                maintenanceCategoryId,
                logDto.assetId(),
                null, // destinationAssetId
                null, // attachmentUrl
                null, // customFields
                links // The new, explicit link to the vehicle
        );
    }

    private TransactionCreateDto buildFuelTransactionDto(FuelLogCreateDto logDto, Vehicle vehicle, UUID userId) {
        if (logDto.assetId() == null) {
            throw new IllegalArgumentException("assetId is required when syncing fuel log to finance.");
        }

        // Find the default "Fuel" category
        UUID fuelCategoryId = categoryService.findCategoryBySystemKey(userId, "CAT_FUEL")
                .map(Category::getId)
                .orElse(null);

        // Create the link to the vehicle
        List<EntityLinkDto> links = List.of(
                new EntityLinkDto(vehicle.getId(), "vehicle"));

        // Use the total invoice amount for the transaction if provided, otherwise use
        // the fuel cost
        BigDecimal transactionAmount = logDto.invoiceAmount() != null ? logDto.invoiceAmount() : logDto.totalCost();

        return new TransactionCreateDto(
                transactionAmount.negate(), // amountOriginal
                logDto.currency(),
                "Fuel: " + vehicle.getName(), // description
                logDto.date(),
                TransactionType.expense,
                fuelCategoryId,
                logDto.assetId(),
                null, // destinationAssetId
                null, // attachmentUrl
                null, // customFields
                links // The new, explicit link
        );
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
        log.setNormalizedQuantityLiters(normalizedQuantity.setScale(3,
                java.math.RoundingMode.HALF_UP));

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
                vehicle.getAssetId(),
                vehicle.getName(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getVin(),
                vehicle.getLicensePlate(),
                vehicle.getCurrentMileage(),
                vehicle.getMileageUnit(),
                vehicle.getFuelType(),
                vehicle.getFuelUnit(),
                vehicle.getInsuranceProvider(),
                vehicle.getInsurancePolicyNumber(),
                vehicle.getNotes(),
                vehicle.getCreatedAt(),
                vehicle.getUpdatedAt());
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
        // 1. Calculate the normalized values
        BigDecimal normalizedQuantity = calculateNormalizedLiters(log.getQuantity(), log.getQuantityUnit());

        // Use the new helper method to get the vehicle's unit
        String vehicleMileageUnit = getVehicleMileageUnit(log.getVehicleId());
        Double normalizedMileage = calculateNormalizedKm(log.getMileageAtFill(), vehicleMileageUnit);

        // 2. Set the transient fields (optional, but good for consistency)
        log.setNormalizedQuantityLiters(normalizedQuantity);
        log.setNormalizedMileageKm(normalizedMileage);

        // 3. Create the DTO
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
                normalizedQuantity, // Pass the calculated values to the DTO
                normalizedMileage);
    }

    // Helper methods for calculation logic
    private String getVehicleMileageUnit(UUID vehicleId) {
        // Fetch the vehicle from the database by its ID
        // .orElseThrow is used to handle the case where the vehicle might not be found
        return vehicleRepository.findById(vehicleId)
                // .map() extracts the mileage unit from the found vehicle
                .map(Vehicle::getMileageUnit)
                // .orElse() provides a default value ('km') if the vehicle is not found,
                // preventing a crash, though this case should be rare.
                .orElse("km");
    }

    private BigDecimal calculateNormalizedLiters(BigDecimal quantity, String unit) {
        if (quantity == null || unit == null)
            return BigDecimal.ZERO;

        // Use a RoundingMode for precision
        return switch (unit.toLowerCase()) {
            case "gallons_us" -> quantity.multiply(new BigDecimal("3.78541")).setScale(3, RoundingMode.HALF_UP);
            case "gallons_uk" -> quantity.multiply(new BigDecimal("4.54609")).setScale(3, RoundingMode.HALF_UP);
            default -> quantity.setScale(3, RoundingMode.HALF_UP); // Assumes liters
        };
    }

    private Double calculateNormalizedKm(Double mileageAtFill, String mileageUnit) {
        if (mileageAtFill == null || mileageUnit == null)
            return 0.0;
        if ("mi".equalsIgnoreCase(mileageUnit)) {
            // No need to create a BigDecimal for simple multiplication
            return mileageAtFill * 1.60934;
        }
        return mileageAtFill;
    }
}