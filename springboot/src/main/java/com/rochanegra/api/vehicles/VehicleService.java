package com.rochanegra.api.vehicles;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleDto createVehicle(VehicleCreateDto createDto, UUID userId) {
        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(userId);
        vehicle.setName(createDto.name());
        vehicle.setMake(createDto.make());
        vehicle.setModel(createDto.model());
        // ... set other fields

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return toDto(savedVehicle);
    }

    public List<VehicleDto> getVehiclesForUser(UUID userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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
            vehicle.getCreatedAt()
        );
    }
}