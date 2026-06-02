package com.senati.obymedic.repository;

import com.senati.obymedic.entity.ExamenLaboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamenRepository extends JpaRepository<ExamenLaboratorio, Long> {
    List<ExamenLaboratorio> findByPaciente_IdOrderByFechaSubidaDesc(Long pacienteId);
    void deleteByPaciente_Id(Long pacienteId);
}