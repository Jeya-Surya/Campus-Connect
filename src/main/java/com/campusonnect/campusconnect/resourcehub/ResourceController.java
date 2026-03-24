package com.campusonnect.campusconnect.resourcehub;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    private final ResourceRepository repo;
    private final ResourceService service;

    public ResourceController(ResourceRepository repo, ResourceService service) {
        this.repo = repo;
        this.service = service;
    }

    @GetMapping
    public List<Resource> list() {
        return repo.findByStatusOrderByIdDesc("APPROVED");
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @RequestParam String resourceType,
            @RequestParam String title,
            @RequestParam String college,
            @RequestParam String course,
            @RequestParam String subject,
            @RequestParam Integer semester,
            @RequestParam MultipartFile file
    ) {
        try {
            Resource r = new Resource();
            r.setResourceType(resourceType);
            r.setTitle(title);
            r.setCollege(college);
            r.setCourse(course);
            r.setSubject(subject);
            r.setSemester(semester);

            String saveStatus = service.save(file, r);
            if ("REJECTED".equals(saveStatus)) {
                return ResponseEntity.badRequest().body("Upload rejected. Only unique PDF files are allowed.");
            }

            return ResponseEntity.ok("Upload successful");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Flexible search that supports empty filters from UI
    @GetMapping("/search")
    public List<Resource> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) Integer semester
    ) {
        return repo.searchApproved(
                "APPROVED",
                clean(type),
                clean(subject),
                clean(college),
                semester
        );
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> download(@PathVariable Long id) throws Exception {
        Resource r = repo.findById(id).orElseThrow();
        File file = new File(r.getFilePath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(new FileInputStream(file)));
    }
}
