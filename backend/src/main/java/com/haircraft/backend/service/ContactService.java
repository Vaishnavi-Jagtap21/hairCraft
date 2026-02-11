package com.haircraft.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.haircraft.backend.Entity.ContactMessage;
import com.haircraft.backend.repository.ContactMessageRepository;

@Service
public class ContactService {

    private final ContactMessageRepository repository;

    public ContactService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    public ContactMessage save(ContactMessage message) {
        return repository.save(message);
    }
    public List<ContactMessage> getAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public void delete(Long id) {
    	repository.deleteById(id);
    }
}
