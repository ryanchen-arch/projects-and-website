const request = require("supertest");

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

describe("API Tests", () => {
  describe("Task 1: Basic API routers", () => {
    it("/api/greet should return JSON object", async () => {
      const response = await request(BASE_URL).get("/api/greet");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Hello, world!");
    });

    it("/api/text-response should return text response", async () => {
      const response = await request(BASE_URL).get("/api/text-response");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello, this is a plain text response.");
    });
  });

  describe("Task 2: Dynamic HTML APIs to /api/html-greet", () => {
    it("should render HTML when no query param is provided", async () => {
      const htmlGreetDefaultResponse = await request(BASE_URL).get(
        "/api/html-greet"
      );
      expect(htmlGreetDefaultResponse.status).toBe(200);
      expect(htmlGreetDefaultResponse.text).toContain("<h1>Hello, World!</h1>");
    });

    it("should render HTML with query param", async () => {
      const htmlGreetQueryResponse = await request(BASE_URL).get(
        "/api/html-greet?name=John"
      );
      expect(htmlGreetQueryResponse.status).toBe(200);
      expect(htmlGreetQueryResponse.text).toContain("<h1>Hello, John!</h1>");
    });
  });

  describe("Task 3: POST requests to /api/personalize", () => {
    it("should return data", async () => {
      const validPostResponse = await request(BASE_URL)
        .post("/api/personalize")
        .send({
          name: "Alice",
          age: 25,
          preferences: {
            color: "blue",
            hobby: "painting",
          },
        });

      expect(validPostResponse.status).toBe(200);
      expect(validPostResponse.body.message).toBe("Hello, Alice!");
      expect(validPostResponse.body.ageMessage).toBe("You're 25 years old.");
      expect(validPostResponse.body.preferencesMessage).toBe(
        "Your favorite color is blue and you enjoy painting."
      );
      expect(validPostResponse.body.offerMessage).toBe(
        "You're eligible for our special offers!"
      );
    });

    it("should return error for invalid data", async () => {
      try {
        await request(BASE_URL).post("/api/personalize").send({
          name: "",
          age: "twenty",
          preferences: {},
        });
      } catch (error) {
        expect(error.status).toBeGreaterThanOrEqual(400);
        expect(error.status).toBeLessThan(500);
      }
    });
  });

  describe("Task 4: dynamic routes to /api/posts/[id]", () => {
    it("should return post information for an existing post ID", async () => {
      const postByIdResponse = await request(BASE_URL).get("/api/posts/1");
      expect(postByIdResponse.status).toBe(200);
      expect(postByIdResponse.body.id).toBe(1);
    });

    it("should return error for a non-existing post ID", async () => {
      try {
        await request(BASE_URL).get("/api/posts/999");
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.response.body.error).toBe("Post not found");
      }
    });
  });

  describe("Task 5: Filtering and pagination to /api/posts", () => {
    it("should return non-empty responses", async () => {
      const postsResponse = await request(BASE_URL).get("/api/posts");
      expect(postsResponse.status).toBe(200);
      expect(postsResponse.body.length).toBeGreaterThan(0);
    });

    it("should return posts filtered by tags", async () => {
      const postsByTagResponse = await request(BASE_URL)
        .get("/api/posts")
        .query({ tags: "javascript" });

      expect(postsByTagResponse.status).toBe(200);
      expect(
        postsByTagResponse.body.every((post) =>
          post.tags.includes("javascript")
        )
      ).toBe(true);
    });

    if (
      ("should return paginated posts",
      async () => {
        const paginatedPostsResponse = await request(BASE_URL)
          .get("/api/posts")
          .query({ tags: "javascript", page: 1, limit: 1 });

        expect(paginatedPostsResponse.status).toBe(200);
        expect(paginatedPostsResponse.body.length).toBe(1);
      })
    );

    it("should return empty response for invalid page number", async () => {
      const emptyPostsResponse = await request(BASE_URL)
        .get("/api/posts")
        .query({ tags: "javascript", page: 10000, limit: 10 });

      expect(emptyPostsResponse.status).toBe(200);
      expect(emptyPostsResponse.body.length).toBe(0);
    });
  });
});
