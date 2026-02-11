package com.haircraft.backend.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SlotAlreadyBookedException extends RuntimeException {

    public SlotAlreadyBookedException(String message) {
		// TODO Auto-generated constructor stub
	}
}
