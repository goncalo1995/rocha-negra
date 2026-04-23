package com.rochanegra.api.modules.nodes.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "node_share_analytics")
@Getter
@Setter
public class NodeShareAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @Column(name = "visitor_ip", length = 45)
    private String visitorIp;

    @Column(name = "visitor_user_agent")
    private String visitorUserAgent;

    @Column(name = "visited_at")
    private Instant visitedAt;

    @Column(name = "share_token", nullable = false)
    private UUID shareToken;
}