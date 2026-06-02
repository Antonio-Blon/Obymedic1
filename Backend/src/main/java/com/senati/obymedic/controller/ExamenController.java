package com.senati.obymedic.controller;

import com.senati.obymedic.entity.ExamenLaboratorio;
import com.senati.obymedic.repository.ExamenRepository;
import com.senati.obymedic.repository.PacienteRepository;
import com.senati.obymedic.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/examenes")
public class ExamenController {

    private final ExamenRepository examenRepo;
    private final PacienteRepository pacienteRepo;
    private final AuthService authService;

    public ExamenController(ExamenRepository examenRepo, PacienteRepository pacienteRepo, AuthService authService) {
        this.examenRepo = examenRepo;
        this.pacienteRepo = pacienteRepo;
        this.authService = authService;
    }

    private boolean noAutorizado(String token) {
        return !authService.isDoctor(token) && !authService.isAdmin(token);
    }

    @PostMapping(value = "/{pacienteId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subir(
            @PathVariable Long pacienteId,
            @RequestParam("titulo") String titulo,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        if (noAutorizado(token)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        if (archivo.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));

        var opt = pacienteRepo.findById(pacienteId);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Paciente no encontrado"));

        try {
            ExamenLaboratorio examen = new ExamenLaboratorio();
            examen.setPaciente(opt.get());
            examen.setTitulo(titulo.trim());
            examen.setNombreArchivo(archivo.getOriginalFilename());
            examen.setContenido(Base64.getEncoder().encodeToString(archivo.getBytes()));
            examenRepo.save(examen);
            return ResponseEntity.ok(Map.of("mensaje", "Examen subido correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al guardar el archivo"));
        }
    }

    @GetMapping("/{pacienteId}")
    public ResponseEntity<?> listar(
            @PathVariable Long pacienteId,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        if (noAutorizado(token)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));

        List<Map<String, Object>> lista = examenRepo.findByPaciente_IdOrderByFechaSubidaDesc(pacienteId)
                .stream()
                .map(e -> Map.<String, Object>of(
                        "id", e.getId(),
                        "titulo", e.getTitulo(),
                        "nombreArchivo", e.getNombreArchivo() != null ? e.getNombreArchivo() : "",
                        "fechaSubida", e.getFechaSubida() != null ? e.getFechaSubida().toString() : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<?> descargar(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        if (noAutorizado(token)) return ResponseEntity.status(401).build();

        return examenRepo.findById(id).map(e -> {
            byte[] bytes = Base64.getDecoder().decode(e.getContenido());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + e.getNombreArchivo() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        if (noAutorizado(token)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        if (!examenRepo.existsById(id)) return ResponseEntity.notFound().build();
        examenRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
