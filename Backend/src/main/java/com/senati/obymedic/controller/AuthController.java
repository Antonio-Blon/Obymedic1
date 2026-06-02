package com.senati.obymedic.controller;

import com.senati.obymedic.entity.Doctor;
import com.senati.obymedic.entity.LoginLog;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.DoctorRepository;
import com.senati.obymedic.repository.LoginLogRepository;
import com.senati.obymedic.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Value("${admin.username}")  private String adminUsername;
    @Value("${admin.password}")  private String adminPassword;
    @Value("${doctor.username}") private String legacyDoctorUser;
    @Value("${doctor.password}") private String legacyDoctorPass;

    private final AuthService          authService;
    private final LoginLogRepository   logRepo;
    private final DoctorRepository     doctorRepo;
    private final ConsultaRepository   consultaRepo;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public AuthController(AuthService authService,
                          LoginLogRepository logRepo,
                          DoctorRepository doctorRepo,
                          ConsultaRepository consultaRepo) {
        this.authService   = authService;
        this.logRepo       = logRepo;
        this.doctorRepo    = doctorRepo;
        this.consultaRepo  = consultaRepo;
    }

    /** Lista pública de doctores para mostrar perfil cards en el login */
    @GetMapping("/doctores-lista")
    public List<Map<String, Object>> doctoresLista() {
        return doctorRepo.findAll().stream()
                .map(d -> Map.<String, Object>of(
                        "id",       d.getId(),
                        "nombre",   d.getNombre(),
                        "username", d.getUsername()
                ))
                .toList();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String u  = body.getOrDefault("username", "");
        String p  = body.getOrDefault("password", "");
        String ip = obtenerIp(request);

        // Admin
        if (adminUsername.equals(u) && adminPassword.equals(p)) {
            String token = authService.newAdminToken();
            logRepo.save(new LoginLog(u, ip, true, "admin"));
            return ResponseEntity.ok(Map.of("token", token, "role", "admin"));
        }

        // Doctor legacy (hardcoded) — accede a todos los datos sin doctorId
        if (legacyDoctorUser.equals(u) && legacyDoctorPass.equals(p)) {
            String token = authService.newDoctorToken(null);
            logRepo.save(new LoginLog(u, ip, true, "doctor"));
            return ResponseEntity.ok(Map.of("token", token, "role", "doctor"));
        }

        // Doctor desde BD
        var doctorOpt = doctorRepo.findByUsername(u);
        if (doctorOpt.isPresent() && bcrypt.matches(p, doctorOpt.get().getPassword())) {
            Doctor d     = doctorOpt.get();
            String token = authService.newDoctorToken(d.getId());
            logRepo.save(new LoginLog(u, ip, true, "doctor"));
            return ResponseEntity.ok(Map.of(
                    "token",    token,
                    "role",     "doctor",
                    "doctorId", d.getId(),
                    "nombre",   d.getNombre()
            ));
        }

        logRepo.save(new LoginLog(u.isBlank() ? "—" : u, ip, false, "acceso"));
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
    }

    @PostMapping("/registro")
    @Transactional
    public ResponseEntity<Map<String, Object>> registro(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        if (!authService.isDoctor(token) && !authService.isAdmin(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }

        String nombre    = body.getOrDefault("nombre", "").trim();
        String username  = body.getOrDefault("username", "").trim();
        String password  = body.getOrDefault("password", "");
        String codigo    = body.getOrDefault("codigoInvitacion", "");

        if (!"Obym@2024".equals(codigo)) {
            return ResponseEntity.status(403).body(Map.of("error", "Código de acceso incorrecto"));
        }
        if (doctorRepo.count() >= 4) {
            return ResponseEntity.status(409).body(Map.of("error", "Se alcanzó el límite de 4 doctores"));
        }
        if (nombre.isEmpty() || username.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Todos los campos son obligatorios"));
        }
        if (doctorRepo.existsByUsername(username)) {
            return ResponseEntity.status(409).body(Map.of("error", "El usuario ya existe"));
        }

        boolean esPrimero = doctorRepo.count() == 0;
        Doctor doctor = new Doctor(nombre, username, bcrypt.encode(password));
        doctorRepo.save(doctor);

        // Asignar datos históricos al primer doctor
        if (esPrimero) {
            consultaRepo.asignarConsultasSinDoctor(doctor.getId());
        }

        return ResponseEntity.ok(Map.of(
                "mensaje",  "Cuenta creada correctamente",
                "doctorId", doctor.getId(),
                "nombre",   doctor.getNombre()
        ));
    }

    @PutMapping("/perfil")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        Long doctorId = authService.getDoctorId(token);
        if (doctorId == null) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));

        var opt = doctorRepo.findById(doctorId);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Doctor no encontrado"));

        Doctor doctor   = opt.get();
        String nombre   = body.getOrDefault("nombre", "").trim();
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        if (nombre.isEmpty() || username.isEmpty())
            return ResponseEntity.status(400).body(Map.of("error", "El nombre y el usuario son obligatorios"));

        if (!doctor.getUsername().equals(username) && doctorRepo.existsByUsername(username))
            return ResponseEntity.status(409).body(Map.of("error", "El usuario ya está en uso"));

        doctor.setNombre(nombre);
        doctor.setUsername(username);
        if (!password.isEmpty()) doctor.setPassword(bcrypt.encode(password));
        doctorRepo.save(doctor);

        return ResponseEntity.ok(Map.of("mensaje", "Perfil actualizado", "nombre", nombre));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (token != null) authService.remove(token);
        return ResponseEntity.ok().build();
    }

    private String obtenerIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
