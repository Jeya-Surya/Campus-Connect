package com.campusonnect.campusconnect.Event;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // 🟢 Add new event
    public Event addEvent(Event event) {
        return eventRepository.save(event);
    }

    // 🟢 Get only upcoming or ongoing events
    public List<Event> getAllEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByEventEndDateTimeAfter(now);
    }

    // 🔍 Search by category
    public List<Event> searchByCategory(String category) {
        return eventRepository.findByCategoryIgnoreCase(category);
    }

    // 🔍 Search by organizer name
    public List<Event> searchByOrganizer(String organizer) {
        return eventRepository.findByOrganizerNameContainingIgnoreCase(organizer);
    }

    // 🔍 Search by date range (between start and end)
    public List<Event> searchByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByEventStartDateTimeBetween(start, end);
    }

    // 🧹 Optional: Delete expired events (for scheduled cleanup)
    public void deleteExpiredEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> expiredEvents = eventRepository.findByEventEndDateTimeBefore(now);
        if (!expiredEvents.isEmpty()) {
            eventRepository.deleteAll(expiredEvents);
        }
    }
}
