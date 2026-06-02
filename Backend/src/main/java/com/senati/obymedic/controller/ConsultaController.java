package com.senati.obymedic.controller;

import com.senati.obymedic.entity.Consulta;
import com.senati.obymedic.service.AuthService;
import com.senati.obymedic.service.ConsultaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;
    private final AuthService     authService;

    public ConsultaController(ConsultaService consultaService, AuthService authService) {
        this.consultaService = consultaService;
        this.authService     = authService;
    }

    @GetMapping
    public List<Consulta> listarTodas(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (authService.isAdmin(token)) return consultaService.listarTodas();
        if (!authService.isDoctor(token)) return List.of();
        Long doctorId = authService.getDoctorId(token);
        if (doctorId == null) return consultaService.listarTodas(); // doctor legacy
        return consultaService.listarPorDoctor(doctorId);
    }

    @PostMapping
    public ResponseEntity<Consulta> registrarConsulta(
            @RequestBody Consulta consulta,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        Long doctorId = authService.getDoctorId(token);
        return ResponseEntity.ok(consultaService.registrarConsulta(consulta, doctorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consulta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(consultaService.buscarPorId(id));
    }

    @GetMapping("/paciente/{idPaciente}")
    public List<Consulta> listarPorPaciente(
            @PathVariable Long idPaciente,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (authService.isAdmin(token)) return consultaService.listarPorPaciente(idPaciente);
        if (!authService.isDoctor(token)) return List.of();
        Long doctorId = authService.getDoctorId(token);
        if (doctorId == null) return consultaService.listarPorPaciente(idPaciente); // legacy
        return consultaService.listarPorPacienteYDoctor(idPaciente, doctorId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Consulta> actualizarConsulta(
            @PathVariable Long id, @RequestBody Consulta consulta) {
        return ResponseEntity.ok(consultaService.actualizarConsulta(id, consulta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        consultaService.eliminarConsulta(id);
        return ResponseEntity.noContent().build();
    }
}
