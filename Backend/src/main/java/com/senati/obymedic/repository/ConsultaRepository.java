package com.senati.obymedic.repository;
import com.senati.obymedic.entity.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByPacienteId(Long idPaciente);
    long countByPacienteId(Long pacienteId);
    void deleteByPacienteId(Long pacienteId);

    List<Consulta> findByDoctorId(Long doctorId);
    List<Consulta> findByPacienteIdAndDoctorId(Long pacienteId, Long doctorId);
    long countByPacienteIdAndDoctorId(Long pacienteId, Long doctorId);

    @Modifying
    @Query("UPDATE Consulta c SET c.doctor.id = :doctorId WHERE c.doctor IS NULL")
    void asignarConsultasSinDoctor(@Param("doctorId") Long doctorId);

    long countByFecha(LocalDate fecha);
    long countByFechaBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT c.fecha, COUNT(c) FROM Consulta c WHERE c.fecha >= :inicio GROUP BY c.fecha ORDER BY c.fecha")
    List<Object[]> countByDia(@Param("inicio") LocalDate inicio);
}