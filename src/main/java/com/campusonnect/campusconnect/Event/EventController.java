package com.campusonnect.campusconnect.Event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    // 🟢 Get only upcoming or ongoing events
    @GetMapping
    public List<Event> getAllEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByEventEndDateTimeAfter(now);
    }

    // 🟢 Create new event (with start & end time)
    @PostMapping
    public ResponseEntity<?> createEvent(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String organizerName,
            @RequestParam String contactInfo,
            @RequestParam String venue,
            @RequestParam String category,
            @RequestParam String eventStartDateTime,
            @RequestParam String eventEndDateTime,
            @RequestParam(required = false) MultipartFile poster
    ) throws IOException {

        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setOrganizerName(organizerName);
        event.setContactInfo(contactInfo);
        event.setVenue(venue);
        event.setCategory(category);

        try {
            event.setEventStartDateTime(LocalDateTime.parse(eventStartDateTime));
            event.setEventEndDateTime(LocalDateTime.parse(eventEndDateTime));
        } catch (Exception e) {
            // fallback for missing seconds in browser datetime
            event.setEventStartDateTime(LocalDateTime.parse(eventStartDateTime + ":00"));
            event.setEventEndDateTime(LocalDateTime.parse(eventEndDateTime + ":00"));
        }

        // 🖼️ Handle file upload
        if (poster != null && !poster.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + poster.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/posters");
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(poster.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            event.setPosterUrl("/uploads/posters/" + fileName);
        }

        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }
}
