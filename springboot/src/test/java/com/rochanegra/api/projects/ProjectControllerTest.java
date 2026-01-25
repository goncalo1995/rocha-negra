// package com.rochanegra.api.projects;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.rochanegra.api.projects.dto.ProjectCreateDto;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;
// import
// org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
// import org.springframework.http.MediaType;
// import org.springframework.security.test.context.support.WithMockUser;
// import org.springframework.test.context.ActiveProfiles;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.UUID;

// import static
// org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static
// org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static
// org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static
// org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @SpringBootTest // Loads the full application context
// @AutoConfigureMockMvc // Provides a MockMvc instance to make fake HTTP
// requests
// @ActiveProfiles("test") // Uses the application-test.properties file
// @Transactional // Rolls back database changes after each test
// class ProjectControllerTest {

// @Autowired
// private MockMvc mockMvc; // The tool for making fake HTTP requests

// @Autowired
// private ObjectMapper objectMapper; // For converting Java objects to JSON
// strings

// @Autowired
// private ProjectService projectService;

// // A mock user UUID for testing security
// private final String MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

// @Test
// @WithMockUser(username = MOCK_USER_ID) // Simulates a logged-in user with
// this ID
// void shouldCreateProjectAndReturnIt() throws Exception {
// // 1. Arrange: Create the data we will send
// ProjectCreateDto createDto = new ProjectCreateDto("Test Project", "A
// description");
// String createDtoJson = objectMapper.writeValueAsString(createDto);

// // 2. Act & Assert: Perform the POST request and check the response
// mockMvc.perform(post("/api/v1/projects")
// .contentType(MediaType.APPLICATION_JSON)
// .content(createDtoJson))
// .andExpect(status().isCreated()) // Expect HTTP 201 Created
// .andExpect(jsonPath("$.name").value("Test Project")) // Check the returned
// JSON name
// .andExpect(jsonPath("$.description").value("A description"))
// .andExpect(jsonPath("$.members[0].userId").value(MOCK_USER_ID)) // Check that
// we are the owner
// .andExpect(jsonPath("$.members[0].role").value("owner"));
// }

// @Test
// @WithMockUser(username = MOCK_USER_ID)
// void shouldReturnListOfProjectsForUser() throws Exception {
// // 1. Arrange: Create a project first so there's something to fetch
// ProjectCreateDto createDto = new ProjectCreateDto("My Project", "Desc");
// projectService.createProject(createDto, UUID.fromString(MOCK_USER_ID)); //
// Assuming projectService is injected
// // or available

// // 2. Act & Assert: Perform the GET request and check the response
// mockMvc.perform(get("/api/v1/projects"))
// .andExpect(status().isOk()) // Expect HTTP 200 OK
// .andExpect(jsonPath("$").isArray()) // Expect a JSON array
// .andExpect(jsonPath("$[0].name").value("My Project"))
// .andExpect(jsonPath("$[0].memberCount").value(1));
// }

// @Test
// void shouldReturnUnauthorizedForUnauthenticatedUser() throws Exception {
// // Act & Assert: Make a request without @WithMockUser
// mockMvc.perform(get("/api/v1/projects"))
// .andExpect(status().isUnauthorized()); // Expect HTTP 401 Unauthorized
// }
// }

// TransactionControllerTest (Test create, update, delete, and verify that asset
// balances change correctly)
// AssetControllerTest
// RecurringRuleControllerTest
// This is your number one priority. These tests are your safety net. They will
// prevent you from accidentally breaking existing features as you build new
// ones.