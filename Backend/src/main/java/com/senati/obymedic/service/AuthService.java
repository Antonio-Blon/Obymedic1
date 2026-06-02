package com.senati.obymedic.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AuthService {

    // token → doctorId (null = legacy hardcoded doctor, kept for migration)
    private final Map<String, Long> doctorTokens = Collections.synchronizedMap(new HashMap<>());
    private final Set<String>       adminTokens  = Collections.synchronizedSet(new HashSet<>());

    public String newDoctorToken(Long doctorId) {
        String t = UUID.randomUUID().toString();
        doctorTokens.put(t, doctorId);
        return t;
    }

    public String newAdminToken() {
        String t = UUID.randomUUID().toString();
        adminTokens.add(t);
        return t;
    }

    public boolean isDoctor(String t) { return t != null && doctorTokens.containsKey(t); }
    public boolean isAdmin(String t)  { return t != null && adminTokens.contains(t); }

    /** Returns doctorId for a doctor token, or null if token is invalid/not a doctor. */
    public Long getDoctorId(String t) {
        if (t == null) return null;
        return doctorTokens.get(t);
    }

    public void remove(String t) {
        doctorTokens.remove(t);
        adminTokens.remove(t);
    }
}
