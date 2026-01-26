package com.campusonnect.campusconnect.Event;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventCleanupService {

    private final EventRepository eventRepository;

    public EventCleanupService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // 🕛 Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteExpiredEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> expiredEvents = eventRepository.findByEventEndDateTimeBefore(now);

        if (!expiredEvents.isEmpty()) {
            eventRepository.deleteAll(expiredEvents);
            System.out.println("🗑️ Deleted " + expiredEvents.size() + " expired events at " + now);
        }
    }
}
