package com.haircraft.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.haircraft.backend.utils.UploadToCloud;

@RestController
@RequestMapping("/image")
//@CrossOrigin(origins = "http://localhost:5174")
public class ImageController {

    private final UploadToCloud uploadToCloud;

    // ✅ Constructor Injection (REQUIRED)
    public ImageController(UploadToCloud uploadToCloud) {
        this.uploadToCloud = uploadToCloud;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        String imageUrl = uploadToCloud.uploadToCloud(file);
        return ResponseEntity.ok(imageUrl);
    }
}
