package com.senati.obymedic.service;

import com.senati.obymedic.entity.Paciente;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.ExamenRepository;
import com.senati.obymedic.repository.PacienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final ExamenRepository examenRepository;

    public PacienteService(PacienteRepository pacienteRepository, ConsultaRepository consultaRepository, ExamenRepository examenRepository) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.examenRepository = examenRepository;
    }

    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    public Optional<Paciente> buscarPorDni(String dni) {
        return pacienteRepository.findByDni(dni);
    }

    public Paciente crearPaciente(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    public Paciente actualizarPaciente(Long id, Paciente pacienteActualizado) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        paciente.setNombreApellidos(pacienteActualizado.getNombreApellidos());
        paciente.setDni(pacienteActualizado.getDni());
        paciente.setTelefono(pacienteActualizado.getTelefono());
        paciente.setDireccion(pacienteActualizado.getDireccion());
        paciente.setDistrito(pacienteActualizado.getDistrito());
        paciente.setProvincia(pacienteActualizado.getProvincia());
        paciente.setFechaNacimiento(pacienteActualizado.getFechaNacimiento());
        paciente.setEdad(pacienteActualizado.getEdad());

        return pacienteRepository.save(paciente);
    }

    @Transactional
    public void eliminarPaciente(Long id) {
        examenRepository.deleteByPaciente_Id(id);   // 1° examenes
        consultaRepository.deleteByPacienteId(id);  // 2° consultas
        pacienteRepository.deleteById(id);           // 3° paciente
    }

    @Transactional
    public int eliminarSinConsultas() {
        List<Paciente> huerfanos = pacienteRepository.findSinConsultas();
        huerfanos.forEach(p -> pacienteRepository.deleteById(p.getId()));
        return huerfanos.size();
    }
}