package com.rochanegra.api.core;

import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SanitizationService {

    // Define a strict policy that allows NO HTML tags.
    // This is the safest default for user input like names, descriptions, and
    // custom fields.
    private final PolicyFactory policy = Sanitizers.BLOCKS
            .and(Sanitizers.STYLES)
            .and(Sanitizers.LINKS); // Example: allows basic formatting if you want

    /**
     * Sanitizes a string, stripping all potentially harmful HTML and script tags.
     * 
     * @param untrustedString The user-provided string.
     * @return A sanitized, safe string.
     */
    public String sanitize(String untrustedString) {
        if (untrustedString == null) {
            return null;
        }
        // For maximum security, we'll use a policy that allows nothing. (could not
        // create it)
        // This will convert "<script>alert('xss')</script>" into
        // "&lt;script&gt;alert('xss')&lt;/script&gt;"
        // which is harmless when rendered.
        return policy.sanitize(untrustedString);
    }

    /**
     * Sanitizes all string values within a Map.
     * 
     * @param untrustedMap The user-provided map for customFields.
     * @return A map with all its string values sanitized.
     */
    public Map<String, Object> sanitizeMap(Map<String, Object> untrustedMap) {
        if (untrustedMap == null) {
            return null;
        }
        Map<String, Object> sanitizedMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : untrustedMap.entrySet()) {
            // We only sanitize the key and string values. Other types (numbers, booleans)
            // are safe.
            String sanitizedKey = sanitize(entry.getKey());
            Object value = entry.getValue();

            if (value instanceof String) {
                sanitizedMap.put(sanitizedKey, sanitize((String) value));
            } else {
                sanitizedMap.put(sanitizedKey, value);
            }
        }
        return sanitizedMap;
    }
}