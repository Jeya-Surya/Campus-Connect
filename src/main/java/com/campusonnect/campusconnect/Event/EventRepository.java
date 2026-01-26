package com.campusonnect.campusconnect.Event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // 🔍 Existing filters
    List<Event> findByCategoryIgnoreCase(String category);
    List<Event> findByOrganizerNameContainingIgnoreCase(String organizerName);

    // 📅 Filter events between two time ranges (optional)
    List<Event> findByEventStartDateTimeBetween(LocalDateTime start, LocalDateTime end);

    // 🟢 Get upcoming or ongoing events (End time is still in future)
    List<Event> findByEventEndDateTimeAfter(LocalDateTime now);

    // 🔴 Get expired events (End time already passed)
    List<Event> findByEventEndDateTimeBefore(LocalDateTime now);
}
