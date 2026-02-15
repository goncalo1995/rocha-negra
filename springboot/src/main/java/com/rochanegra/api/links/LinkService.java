package com.rochanegra.api.links;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LinkService {

    private final EntityLinkRepository linkRepository;

    @Transactional
    public LinkDto createLink(LinkCreateDto createDto, UUID userId) {
        // Here you could add validation logic, e.g., check if the source/target
        // entities actually exist

        EntityLink link = new EntityLink();
        link.setUserId(userId);
        link.setSourceEntityId(createDto.sourceEntityId());
        link.setSourceEntityType(createDto.sourceEntityType());
        link.setTargetEntityId(createDto.targetEntityId());
        link.setTargetEntityType(createDto.targetEntityType());
        link.setRelationType(createDto.relationType());

        EntityLink savedLink = linkRepository.save(link);
        return toDto(savedLink);
    }

    // Example of a useful query: "Get all transactions (sources) for a specific
    // project (target)"
    public List<LinkDto> getLinksForTarget(UUID targetId, String targetType, UUID userId) {
        return linkRepository.findByUserIdAndTargetEntityIdAndTargetEntityType(userId, targetId, targetType)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<LinkDto> getLinksForSource(UUID sourceId, String sourceType, UUID userId) {
        if (sourceType != null) {
            return linkRepository.findByUserIdAndSourceEntityIdAndSourceEntityType(userId, sourceId, sourceType)
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        return linkRepository.findByUserIdAndSourceEntityId(userId, sourceId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLink(UUID linkId, UUID userId) {
        EntityLink link = linkRepository.findById(linkId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Link not found"));
        linkRepository.delete(link);
    }

    private LinkDto toDto(EntityLink link) {
        return new LinkDto(
                link.getId(),
                link.getSourceEntityId(),
                link.getSourceEntityType(),
                link.getTargetEntityId(),
                link.getTargetEntityType(),
                link.getRelationType());
    }
}