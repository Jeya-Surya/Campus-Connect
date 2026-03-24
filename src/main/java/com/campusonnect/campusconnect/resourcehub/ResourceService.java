package com.campusonnect.campusconnect.resourcehub;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.UUID;

@Service
public class ResourceService {

    private final ResourceRepository repo;

    public ResourceService(ResourceRepository repo) {
        this.repo = repo;
    }

    public String save(MultipartFile file, Resource r) throws Exception {

        boolean safe = true;

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        boolean pdfByType = "application/pdf".equalsIgnoreCase(file.getContentType());
        boolean pdfByName = originalName.endsWith(".pdf");

        // 1) Only PDF
        if (!pdfByType && !pdfByName) {
            safe = false;
        }

        // 2) Duplicate check (SHA-256)
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        String hash = Base64.getEncoder().encodeToString(md.digest(file.getBytes()));

        if (repo.existsByFileHash(hash)) {
            safe = false;
        }

        if (!safe) {
            r.setStatus("REJECTED");
            repo.save(r);
            return "REJECTED";
        }

        // 3) Save file
        Path uploadDir = Paths.get("uploads");
        Files.createDirectories(uploadDir);

        String safeName = UUID.randomUUID() + "_" + (file.getOriginalFilename() == null ? "resource.pdf" : file.getOriginalFilename());
        Path filePath = uploadDir.resolve(safeName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        r.setFilePath(filePath.toString());
        r.setFileHash(hash);

        // ⭐ AUTO APPROVAL
        r.setStatus("APPROVED");

        repo.save(r);
        return "APPROVED";
    }
}
