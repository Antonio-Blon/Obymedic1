package com.senati.obymedic.controller;

import com.senati.obymedic.entity.Consulta;
import com.senati.obymedic.entity.Paciente;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.PacienteRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/backup")
public class BackupController {

    private final PacienteRepository pacienteRepo;
    private final ConsultaRepository consultaRepo;

    public BackupController(PacienteRepository pacienteRepo, ConsultaRepository consultaRepo) {
        this.pacienteRepo = pacienteRepo;
        this.consultaRepo = consultaRepo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> descargarBackup() {
        List<Paciente> pacientes = pacienteRepo.findAll();
        List<Consulta> consultas = consultaRepo.findAll();

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"));

        Map<String, Object> backup = new LinkedHashMap<>();
        backup.put("exportado_en", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        backup.put("total_pacientes", pacientes.size());
        backup.put("total_consultas", consultas.size());
        backup.put("pacientes", pacientes);
        backup.put("consultas", consultas);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"backup_obymedic_" + timestamp + ".json\"")
                .body(backup);
    }
}
