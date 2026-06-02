package com.senati.obymedic.repository;

import com.senati.obymedic.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUsername(String username);
    boolean existsByUsername(String username);
    long count();
}
