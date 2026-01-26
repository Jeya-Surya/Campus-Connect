package com.campusonnect.campusconnect.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusonnect.campusconnect.model.Doubt;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {
}