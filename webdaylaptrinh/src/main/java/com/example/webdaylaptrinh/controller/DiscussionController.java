package com.example.webdaylaptrinh.controller;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.dto.DiscussionRequest;
import com.example.webdaylaptrinh.entity.Discussion;
import com.example.webdaylaptrinh.service.DiscussionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @GetMapping("/{courseId}")
    public ResponseEntity<List<Discussion>> getDiscussionsAndCourse(@PathVariable UUID courseId) {
        List<Discussion> discussions = discussionService.getDiscussionsCourse(courseId);
        return ResponseEntity.ok(discussions);
    }

    @PostMapping("/addMessage")
    public ResponseEntity<Discussion> createDiscussion(@RequestBody DiscussionRequest discussionRequest) {
        Discussion discussion = discussionService.createDiscussion(discussionRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(discussion);
    }
}
