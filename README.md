# SISTEMA DE GESTION DE HISTORIAS CLINICAS - OBYMEDIC

[![TRELLO](https://img.shields.io/badge/TRELLO-KANBAN-blue?style=for-the-badge&logo=trello&logoColor=white)](https://trello.com/invite/b/69bc3ede73d188581baa1482/ATTI3f827d0ff18d1e9bfddfe0ef1a6bd47a27F9FC1E/proyecto-consultas-obymedic)
[![FIGMA](https://img.shields.io/badge/FIGMA-DISENO-red?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/F0hS7gps6mz5811iBBZVr8/Entregable-01?node-id=1-2&t=1I4VFzDYAzfZAZIh-1)

## TRELLO
Más info en [mi tablero de trello](https://trello.com/invite/b/69bc3ede73d188581baa1482/ATTI3f827d0ff18d1e9bfddfe0ef1a6bd47a27F9FC1E/proyecto-consultas-obymedic)
![TRELLO](recursos/programacion.png)



Sistema web para la gestión de registros de historiales medicos de Obstetricia

## Descripcion del negocio
Nombre: Alber Einstein Muños de la flor <br>
Consultorio Médico: Obymedic <br>
RUC: 10431624163 <br>
El consultorio brinda atención médica general y especialmente de Obstetricia <br>


## Identificar el problema y solución
Problema: Actualmente el médico registra los historiales médicos de manera manual (en físico), lo que genera. <br>
•	Pérdida de tiempo al buscar información<br>
•	Riesgo de extravío de documentos<br>
•	Desorganización en los registros<br>
•	Dificultad para encontrar historiales por paciente<br>
•	Acumulación de archivos físicos<br>

Solucion tecnologica: Se desarrollará un Sistema Digital de Gestión de Historiales Médicos, el cual permitirá:
•	Registrar pacientes con su DNI. <br>
•	Guardar múltiples historiales asociados a un mismo DNI. <br>
•	Implementar un filtro de búsqueda por DNI. <br>
•	Mostrar automáticamente los datos del paciente y fechas de atención. <br>
•	Almacenar la información en una base de datos digital. <br>

 
## Requerimientos Funcionales
| Requerimiento | Descripcion |
|---|---|
| Registrar paciente | El sistema debe permitir registrar pacientes utilizando su DNI.|
| Guardar datos del paciente | El sistema debe almacenar nombre completo, edad, teléfono y dirección del paciente. |
| Registrar historial médico | El sistema debe permitir registrar un historial médico asociado al DNI del paciente. |
| Guardar información médica | El historial debe incluir fecha de atención, diagnóstico, tratamiento y observaciones. |
| Búsqueda de paciente | El sistema debe permitir buscar pacientes mediante su DNI. |
| Mostrar resultados | El sistema debe mostrar el nombre del paciente y las fechas de sus historiales médicos. |
| Ver detalle del historial | El sistema debe mostrar el nombre del paciente y las fechas de sus historiales médicos.   |
| Editar historial médico | El sistema debe permitir modificar o actualizar la información del historial médico. |
 
## Requerimientos No Funcionales
 
| Requerimiento | Descripcion |
|---|---|
| Facilidad de uso | El sistema debe tener una interfaz sencilla y fácil de usar. |
| Seguridad | El acceso al sistema debe realizarse mediante usuario y contraseña. |
| Almacenamiento seguro | La información debe almacenarse en una base de datos segura. |
| Rendimiento | El sistema debe responder a las búsquedas en menos de 3 segundos. |
## Stack completo
1. Trello             = Gestión del proyecto (Kanban)
2. Draw.io            = Diagrama ER + Diagrama de Clases
3. Figma              = Wireframe + Diseño UI/UX
4. MySQL Workbench    = Diseñar y administrar BD
5. IntelliJ           = Frontend (HTML,CSS,JS) + Backend (Spring Boot)
6. XAMPP              = Servidor Tomcat para correr la app

## Tecnologias utilizadas
- Java 17
- Spring Boot 3
- MySQL 8
- HTML5, CSS3, JavaScript
- IntelliJ IDEA
- XAMPP (Tomcat)
- MySQL Workbench
- Figma (diseño UI/UX)
- Draw.io (diagramas)

## Estructura del proyecto
 
```
JavaWeb-Obymedic/
├── backend/          → Spring Boot (Java)
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/         → HTML, CSS, JS
│   ├── css/
│   ├── js/
│   └── interfaz.html
```

## Base de datos
 
El sistema cuenta con 4 tablas principales:
 
| Tabla | Descripcion |
|---|---|
| PACIENTE | Consulta si el cliente tiene un registro previo. |
| HISTORIAL_CLINICA | Registra el historial clinico y lo guarda en la base de datos |


  
### Diagrama Entidad-Relacion (DER)
![Diagrama Entidad Relacion](recursos/Diagrama_Entidad_Relacion.png)
 
### Modelo Relacional (MR)
![Modelo Relacional](recursos/Modelo_Relacional.png)



### DIAGRAMA DE FIGMA

Más info en [Mi_Diseño_Figma](https://www.figma.com/design/F0hS7gps6mz5811iBBZVr8/Entregable-01?node-id=1-2&t=1I4VFzDYAzfZAZIh-1)

![FIGMA](recursos/figma.png)


### Base de datos
 
El sistema cuenta con 4 tablas principales:

``` sql
CREATE DATABASE obymedic;
USE obymedic;
CREATE TABLE pacientes (
    id_paciente BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    nombre_apellidos VARCHAR(150) NOT NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    distrito VARCHAR(100),
    provincia VARCHAR(100),

    fecha_nacimiento VARCHAR(20),
    edad INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE consultas (
    id_consulta BIGINT AUTO_INCREMENT PRIMARY KEY,

    id_paciente BIGINT NOT NULL,

    fecha DATE,
    motivo VARCHAR(255),
    edad INT,

    pa VARCHAR(20),
    fc VARCHAR(20),
    fr VARCHAR(20),
    temperatura VARCHAR(20),
    peso DOUBLE,
    talla DOUBLE,
    spo2 VARCHAR(10),

    diagnostico TEXT,
    tratamiento TEXT,
    examenes_auxiliares TEXT,

    proxima_cita DATE,
    firma_sello VARCHAR(150),
    atencion_por VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- RELACION CON PACIENTES
    CONSTRAINT fk_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES pacientes(id_paciente)
    ON DELETE CASCADE
);
```

## Como correr el proyecto
 
### Requisitos previos
- Tener instalado IntelliJ IDEA
- Tener instalado XAMPP (para MySQL)
- Tener instalado MySQL Workbench
- Tener instalado JDK 21 o superior
 
### Backend
1. Abrir la carpeta `backend/` en IntelliJ IDEA
2. Configurar `application.properties` con los datos de MySQL
3. Iniciar XAMPP y activar MySQL
4. Ejecutar `GotagotaApplication.java`
5. El backend corre en: `http://localhost:8080`
 
### Frontend
1. Abrir la carpeta `frontend/` en VsCode
2. Abrir `index.html` con Live Server
3. El frontend se comunica con el backend via fetch()
 
> El frontend y el backend corren por separado.
> El backend debe estar iniciado antes de abrir el frontend.
 
### Configuracion de base de datos

```
spring.application.name=obymedic

#CONEXION A MYSQL
spring.datasource.url=jdbc:mysql://localhost:3306/obymedic
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / HIBERNATE
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect

# PUERTO
server.port=8080

```


