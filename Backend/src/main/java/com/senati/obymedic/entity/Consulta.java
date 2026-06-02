package com.senati.obymedic.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultas")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = true)
    private Doctor doctor;

    private LocalDate fecha;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    // La BD tiene la columna como "edad", no "edad_consulta"
    @Column(name = "edad")
    private Integer edadConsulta;

    @Column(length = 20)
    private String pa;

    @Column(length = 20)
    private String fc;

    @Column(length = 20)
    private String fr;

    @Column(length = 20)
    private String temperatura;

    private Double peso;

    private Double talla;

    @Column(length = 10)
    private String spo2;

    @Column(name = "examen_fisico", columnDefinition = "TEXT")
    private String examenFisico;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(columnDefinition = "TEXT")
    private String tratamiento;

    @Column(name = "examenes_auxiliares", columnDefinition = "TEXT")
    private String examenesAuxiliares;

    @Column(name = "proxima_cita")
    private LocalDate proximaCita;

    @Column(name = "firma_sello", length = 150)
    private String firmaSello;

    @Column(name = "atencion_por", length = 150)
    private String atencionPor;

    // La BD gestiona estos campos automáticamente (DEFAULT CURRENT_TIMESTAMP)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Integer getEdadConsulta() {
        return edadConsulta;
    }

    public void setEdadConsulta(Integer edadConsulta) {
        this.edadConsulta = edadConsulta;
    }

    public String getPa() {
        return pa;
    }

    public void setPa(String pa) {
        this.pa = pa;
    }

    public String getFc() {
        return fc;
    }

    public void setFc(String fc) {
        this.fc = fc;
    }

    public String getFr() {
        return fr;
    }

    public void setFr(String fr) {
        this.fr = fr;
    }

    public String getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(String temperatura) {
        this.temperatura = temperatura;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Double getTalla() {
        return talla;
    }

    public void setTalla(Double talla) {
        this.talla = talla;
    }

    public String getSpo2() {
        return spo2;
    }

    public void setSpo2(String spo2) {
        this.spo2 = spo2;
    }

    public String getExamenFisico() {
        return examenFisico;
    }

    public void setExamenFisico(String examenFisico) {
        this.examenFisico = examenFisico;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTratamiento() {
        return tratamiento;
    }

    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }

    public String getExamenesAuxiliares() {
        return examenesAuxiliares;
    }

    public void setExamenesAuxiliares(String examenesAuxiliares) {
        this.examenesAuxiliares = examenesAuxiliares;
    }

    public LocalDate getProximaCita() {
        return proximaCita;
    }

    public void setProximaCita(LocalDate proximaCita) {
        this.proximaCita = proximaCita;
    }

    public String getFirmaSello() {
        return firmaSello;
    }

    public void setFirmaSello(String firmaSello) {
        this.firmaSello = firmaSello;
    }

    public String getAtencionPor() {
        return atencionPor;
    }

    public void setAtencionPor(String atencionPor) {
        this.atencionPor = atencionPor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
