package com.senati.obymedic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctores")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    public Doctor() {}

    public Doctor(String nombre, String username, String password) {
        this.nombre   = nombre;
        this.username = username;
        this.password = password;
    }

    public Long getId()                      { return id; }
    public void setId(Long id)               { this.id = id; }

    public String getNombre()                { return nombre; }
    public void setNombre(String nombre)     { this.nombre = nombre; }

    public String getUsername()              { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword()              { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getFechaCreacion()               { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fc)        { this.fechaCreacion = fc; }
}
