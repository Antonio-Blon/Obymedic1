package com.senati.obymedic.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.senati.obymedic.entity.Paciente;
import com.senati.obymedic.service.PacienteService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    @Value("${apiperu.token}")
    private String apiPeruToken;

    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @GetMapping
    public List<Paciente> listarPacientes() {
        return pacienteService.listarTodos();
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Paciente> buscarPorDni(@PathVariable String dni) {
        return pacienteService.buscarPorDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reniec/{dni}")
    public ResponseEntity<Map<String, String>> consultarReniec(@PathVariable String dni) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://apiperu.dev/api/dni/" + dni))
                    .header("Authorization", "Bearer " + apiPeruToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = new ObjectMapper().readTree(response.body());
            if (root.path("success").asBoolean()) {
                String nombre = root.path("data").path("nombre_completo").asText("");
                return ResponseEntity.ok(Map.of("nombreCompleto", nombre));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizarPaciente(@PathVariable Long id, @RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.actualizarPaciente(id, paciente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}