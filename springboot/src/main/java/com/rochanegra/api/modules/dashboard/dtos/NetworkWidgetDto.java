package com.rochanegra.api.modules.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.modules.network.ContactDto;

// later change to summaryDto if contact grows
public record NetworkWidgetDto(
        int totalContacts,
        List<ContactDto.Detail> contacts) {
}
