package com.senati.obymedic.repository;
import com.senati.obymedic.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByDni(String dni);

    @Query("SELECT p FROM Paciente p WHERE p.id NOT IN (SELECT DISTINCT c.paciente.id FROM Consulta c)")
    List<Paciente> findSinConsultas();
}