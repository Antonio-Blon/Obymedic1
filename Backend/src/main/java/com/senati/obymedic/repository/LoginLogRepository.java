package com.senati.obymedic.repository;

import com.senati.obymedic.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findTop100ByOrderByFechaHoraDesc();
}
