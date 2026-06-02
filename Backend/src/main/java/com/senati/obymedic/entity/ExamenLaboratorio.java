package com.senati.obymedic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "examenes_laboratorio")
public class ExamenLaboratorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(name = "nombre_archivo", length = 200)
    private String nombreArchivo;

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @CreationTimestamp
    @Column(name = "fecha_subida", updatable = false)
    private LocalDateTime fechaSubida;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }
}
