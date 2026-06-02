package com.senati.obymedic.service;

import com.senati.obymedic.entity.Consulta;
import com.senati.obymedic.entity.Paciente;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.DoctorRepository;
import com.senati.obymedic.repository.PacienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final DoctorRepository   doctorRepository;

    public ConsultaService(ConsultaRepository consultaRepository,
                           PacienteRepository pacienteRepository,
                           DoctorRepository   doctorRepository) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.doctorRepository   = doctorRepository;
    }

    public List<Consulta> listarTodas() {
        return consultaRepository.findAll();
    }

    public List<Consulta> listarPorDoctor(Long doctorId) {
        return consultaRepository.findByDoctorId(doctorId);
    }

    public List<Consulta> listarPorPaciente(Long idPaciente) {
        return consultaRepository.findByPacienteId(idPaciente);
    }

    public List<Consulta> listarPorPacienteYDoctor(Long idPaciente, Long doctorId) {
        return consultaRepository.findByPacienteIdAndDoctorId(idPaciente, doctorId);
    }

    @Transactional
    public Consulta registrarConsulta(Consulta consulta, Long doctorId) {
        Paciente paciente = consulta.getPaciente();
        Paciente pacienteExistente = pacienteRepository.findByDni(paciente.getDni())
                .orElseGet(() -> pacienteRepository.save(paciente));
        consulta.setPaciente(pacienteExistente);

        if (doctorId != null) {
            doctorRepository.findById(doctorId).ifPresent(consulta::setDoctor);
        }

        return consultaRepository.save(consulta);
    }

    public Consulta buscarPorId(Long id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));
    }

    public Consulta actualizarConsulta(Long id, Consulta consultaActualizada) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        consulta.setFecha(consultaActualizada.getFecha());
        consulta.setMotivo(consultaActualizada.getMotivo());
        consulta.setEdadConsulta(consultaActualizada.getEdadConsulta());
        consulta.setPa(consultaActualizada.getPa());
        consulta.setFc(consultaActualizada.getFc());
        consulta.setFr(consultaActualizada.getFr());
        consulta.setTemperatura(consultaActualizada.getTemperatura());
        consulta.setPeso(consultaActualizada.getPeso());
        consulta.setTalla(consultaActualizada.getTalla());
        consulta.setSpo2(consultaActualizada.getSpo2());
        consulta.setExamenFisico(consultaActualizada.getExamenFisico());
        consulta.setDiagnostico(consultaActualizada.getDiagnostico());
        consulta.setTratamiento(consultaActualizada.getTratamiento());
        consulta.setExamenesAuxiliares(consultaActualizada.getExamenesAuxiliares());
        consulta.setProximaCita(consultaActualizada.getProximaCita());
        consulta.setAtencionPor(consultaActualizada.getAtencionPor());
        consulta.setFirmaSello(consultaActualizada.getFirmaSello());

        return consultaRepository.save(consulta);
    }

    @Transactional
    public void eliminarConsulta(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));
        Long pacienteId = consulta.getPaciente().getId();
        Long doctorId   = consulta.getDoctor() != null ? consulta.getDoctor().getId() : null;
        consultaRepository.deleteById(id);

        long restantes = doctorId != null
                ? consultaRepository.countByPacienteIdAndDoctorId(pacienteId, doctorId)
                : consultaRepository.countByPacienteId(pacienteId);

        if (restantes == 0) {
            pacienteRepository.deleteById(pacienteId);
        }
    }
}
