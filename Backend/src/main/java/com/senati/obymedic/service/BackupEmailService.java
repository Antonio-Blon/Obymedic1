package com.senati.obymedic.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.senati.obymedic.repository.ConsultaRepository;
import com.senati.obymedic.repository.PacienteRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BackupEmailService {

    private final PacienteRepository pacienteRepo;
    private final ConsultaRepository consultaRepo;
    private final JavaMailSender mailSender;

    @Value("${backup.email.destino}")
    private String emailDestino;

    @Value("${spring.mail.username}")
    private String emailOrigen;

    public BackupEmailService(PacienteRepository pacienteRepo,
                              ConsultaRepository consultaRepo,
                              JavaMailSender mailSender) {
        this.pacienteRepo = pacienteRepo;
        this.consultaRepo = consultaRepo;
        this.mailSender   = mailSender;
    }

    // Todos los lunes a las 7:00 AM (hora UTC)
    @Scheduled(cron = "0 0 7 * * MON")
    public void enviarBackupSemanal() {
        try {
            var pacientes = pacienteRepo.findAll();
            var consultas = consultaRepo.findAll();

            Map<String, Object> backup = new LinkedHashMap<>();
            backup.put("exportado_en", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            backup.put("total_pacientes", pacientes.size());
            backup.put("total_consultas", consultas.size());
            backup.put("pacientes", pacientes);
            backup.put("consultas", consultas);

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            byte[] json = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(backup);
            String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String nombreArchivo = "backup_obymedic_" + fecha + ".json";

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(emailOrigen);
            helper.setTo(emailDestino);
            helper.setSubject("Backup semanal OBYMEDIC — " + fecha);
            helper.setText(
                "Hola,\n\nAdjunto encontrarás el backup semanal de OBYMEDIC con " +
                pacientes.size() + " pacientes y " + consultas.size() + " consultas registradas.\n\n" +
                "Este correo se genera automáticamente cada lunes.\n\n— Sistema OBYMEDIC"
            );
            helper.addAttachment(nombreArchivo, new ByteArrayResource(json));

            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Error al enviar backup por correo: " + e.getMessage());
        }
    }
}
