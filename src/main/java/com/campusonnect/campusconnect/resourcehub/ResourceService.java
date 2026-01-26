package com.campusonnect.campusconnect.resourcehub;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class ResourceService {

    private final ResourceRepository repo;

    public ResourceService(ResourceRepository repo) {
        this.repo = repo;
    }

    public void save(MultipartFile file, Resource r) throws Exception {

        boolean safe = true;

        // 1️⃣ Only PDF
        if (!"application/pdf".equals(file.getContentType())) {
            safe = false;
        }

        // 2️⃣ Max size 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            safe = false;
        }

        // 3️⃣ Duplicate check (SHA-256)
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        String hash = Base64.getEncoder().encodeToString(md.digest(file.getBytes()));

        if (repo.existsByFileHash(hash)) {
            safe = false;
        }

        if (!safe) {
            r.setStatus("REJECTED");
            repo.save(r);
            return;
        }

        // 4️⃣ Save file
        Path uploadDir = Paths.get("uploads");
        Files.createDirectories(uploadDir);

        Path filePath = uploadDir.resolve(file.getOriginalFilename());
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        r.setFilePath(filePath.toString());
        r.setFileHash(hash);

        // ⭐ AUTO APPROVAL
        r.setStatus("APPROVED");

        repo.save(r);
    }
}
