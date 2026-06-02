package com.senati.obymedic.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String usuario;

    @Column(length = 60)
    private String ip;

    private boolean exitoso;

    @Column(length = 10)
    private String tipo; // "doctor" o "admin"

    @CreationTimestamp
    @Column(name = "fecha_hora", updatable = false)
    private LocalDateTime fechaHora;

    public LoginLog() {}

    public LoginLog(String usuario, String ip, boolean exitoso, String tipo) {
        this.usuario = usuario;
        this.ip      = ip;
        this.exitoso = exitoso;
        this.tipo    = tipo;
    }

    public Long getId()              { return id; }
    public String getUsuario()       { return usuario; }
    public String getIp()            { return ip; }
    public boolean isExitoso()       { return exitoso; }
    public String getTipo()          { return tipo; }
    public LocalDateTime getFechaHora() { return fechaHora; }
}
