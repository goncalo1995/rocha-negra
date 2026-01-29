package com.rochanegra.api.services;

import com.oracle.bmc.objectstorage.requests.GetObjectRequest;
import com.oracle.bmc.objectstorage.responses.GetObjectResponse;
import com.rochanegra.api.config.OSClientConfiguration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

@Service
public class FileOSService {
    String bucketName = "analysis-reports";
    String namespace = "axszlupjq5de";

    @Autowired
    private OSClientConfiguration clientConfiguration;

    public String getReportFileContent(String filename) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .namespaceName(namespace)
                .bucketName(bucketName)
                .objectName(filename)
                .build();

        try {
            GetObjectResponse objectResponse = clientConfiguration.getObjectStorage().getObject(objectRequest);
            InputStream inputStream = objectResponse.getInputStream();

            String content = new BufferedReader(new InputStreamReader(inputStream)).lines()
                    .collect(Collectors.joining());
            return content;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }
}