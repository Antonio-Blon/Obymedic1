package com.senati.obymedic.controller;

import com.senati.obymedic.entity.LoginLog;
import com.senati.obymedic.entity.Paciente;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.DoctorRepository;
import com.senati.obymedic.repository.LoginLogRepository;
import com.senati.obymedic.service.AuthService;
import com.senati.obymedic.service.PacienteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("api/admin")
public class AdminController {

    private final PacienteService    pacienteService;
    private final ConsultaRepository consultaRepo;
    private final LoginLogRepository logRepo;
    private final AuthService        authService;
    private final DoctorRepository   doctorRepo;

    public AdminController(PacienteService pacienteService,
                           ConsultaRepository consultaRepo,
                           LoginLogRepository logRepo,
                           AuthService authService,
                           DoctorRepository doctorRepo) {
        this.pacienteService = pacienteService;
        this.consultaRepo    = consultaRepo;
        this.logRepo         = logRepo;
        this.authService     = authService;
        this.doctorRepo      = doctorRepo;
    }

    @GetMapping("/doctores")
    public ResponseEntity<List<Map<String, Object>>> getDoctores(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        var doctores = doctorRepo.findAll().stream()
                .map(d -> {
                    long consultas = consultaRepo.findByDoctorId(d.getId()).size();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",            d.getId());
                    m.put("nombre",        d.getNombre());
                    m.put("username",      d.getUsername());
                    m.put("fechaCreacion", d.getFechaCreacion());
                    m.put("consultas",     consultas);
                    return m;
                })
                .toList();
        return ResponseEntity.ok(doctores);
    }

    @GetMapping("/doctores/{id}/consultas")
    public ResponseEntity<List<Map<String, Object>>> getConsultasDoctor(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        LocalDate hoy    = LocalDate.now();
        LocalDate semana = hoy.minusDays(6);
        LocalDate mes    = hoy.withDayOfMonth(1);
        var consultas = consultaRepo.findByDoctorId(id);
        var result = consultas.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",     c.getId());
            m.put("fecha",  c.getFecha());
            m.put("paciente", c.getPaciente() != null ? Map.of(
                "id",              c.getPaciente().getId(),
                "nombreApellidos", c.getPaciente().getNombreApellidos() != null ? c.getPaciente().getNombreApellidos() : "",
                "dni",             c.getPaciente().getDni() != null ? c.getPaciente().getDni() : ""
            ) : null);
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getPacientes(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();

        LocalDate hoy     = LocalDate.now();
        LocalDate semana  = hoy.minusDays(6);
        LocalDate mes     = hoy.withDayOfMonth(1);
        LocalDate d30     = hoy.minusDays(29);

        long consultasHoy    = consultaRepo.countByFecha(hoy);
        long consultasSemana = consultaRepo.countByFechaBetween(semana, hoy);
        long consultasMes    = consultaRepo.countByFechaBetween(mes, hoy);
        long totalConsultas  = consultaRepo.count();
        long totalPacientes  = pacienteService.listarTodos().size();

        // Últimos 30 días agrupados por día
        List<Object[]> raw = consultaRepo.countByDia(d30);
        Map<String, Long> porDia = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 29; i >= 0; i--) {
            porDia.put(hoy.minusDays(i).format(fmt), 0L);
        }
        for (Object[] row : raw) {
            LocalDate fecha = (LocalDate) row[0];
            if (!fecha.isBefore(d30)) {
                porDia.put(fecha.format(fmt), (Long) row[1]);
            }
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPacientes",  totalPacientes);
        stats.put("totalConsultas",  totalConsultas);
        stats.put("consultasHoy",    consultasHoy);
        stats.put("consultasSemana", consultasSemana);
        stats.put("consultasMes",    consultasMes);
        stats.put("porDia",          porDia);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<LoginLog>> getLogs(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(logRepo.findTop100ByOrderByFechaHoraDesc());
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        logRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/pacientes-huerfanos")
    public ResponseEntity<Map<String, Integer>> eliminarHuerfanos(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        int eliminados = pacienteService.eliminarSinConsultas();
        return ResponseEntity.ok(Map.of("eliminados", eliminados));
    }

    @DeleteMapping("/logs")
    public ResponseEntity<Void> deleteAllLogs(
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        logRepo.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/doctores/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!validar(token)) return ResponseEntity.status(401).build();
        doctorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean validar(String token) {
        return authService.isAdmin(token);
    }

    private String obtenerIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
