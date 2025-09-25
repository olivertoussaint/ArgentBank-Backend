const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userService = require("../server/services/userService");
const User = require("../server/database/models/userModel");
const { SECRET_KEY } = require("../server/config");

const userData = {
  email: "unittest@example.com",
  password: "UnitTest123!",
  firstName: "Unit",
  lastName: "Test",
};

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/argent-bank", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await User.deleteMany({ email: userData.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("🔁 Unit Tests - userService.js", () => {
  describe("🟩 createUser", () => {
    it("✅ should create a new user", async () => {
      const user = await userService.createUser(userData);
      expect(user).toHaveProperty("email", userData.email);
    });

    it("🚫 should not allow duplicate emails", async () => {
      await userService.createUser(userData);
      await expect(userService.createUser(userData)).rejects.toThrow(
        "Email already exists"
      );
    });
  });

  describe("🟦 loginUser", () => {
    beforeEach(async () => {
      await userService.createUser(userData);
    });

    it("✅ should login with correct credentials", async () => {
      const result = await userService.loginUser({
        email: userData.email,
        password: userData.password,
      });

      expect(result).toHaveProperty("token");
      expect(result.user).toHaveProperty("email", userData.email);
    });

    it("🚫 should fail with wrong password", async () => {
      await expect(
        userService.loginUser({
          email: userData.email,
          password: "wrongpassword",
        })
      ).rejects.toThrow("Password is invalid");
    });

    it("🚫 should fail with unknown email", async () => {
      await expect(
        userService.loginUser({
          email: "unknown@example.com",
          password: "doesntmatter",
        })
      ).rejects.toThrow("User not found");
    });
  });

  describe("🟨 getUserProfile", () => {
    let token;

    beforeEach(async () => {
      await userService.createUser(userData);
      const loginRes = await userService.loginUser({
        email: userData.email,
        password: userData.password,
      });
      token = loginRes.token;
    });

    it("✅ should return the user profile", async () => {
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const user = await userService.getUserProfile(mockReq);
      expect(user).toHaveProperty("email", userData.email);
    });

    it("🚫 should fail with invalid token", async () => {
      const mockReq = {
        headers: {
          authorization: "Bearer fake.token.value",
        },
      };

      await expect(userService.getUserProfile(mockReq)).rejects.toThrow();
    });

    it("🚫 should fail if token is missing", async () => {
      const mockReq = { headers: {} };
      await expect(userService.getUserProfile(mockReq)).rejects.toThrow();
    });
  });

  describe("🟨 updateUserProfile", () => {
    let token;

    beforeEach(async () => {
      await userService.createUser(userData);
      const loginRes = await userService.loginUser({
        email: userData.email,
        password: userData.password,
      });
      token = loginRes.token;
    });

    it("✅ should update user profile successfully", async () => {
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: {
          firstName: "Updated",
          lastName: "Name",
        },
      };

      const updatedUser = await userService.updateUserProfile(mockReq);
      expect(updatedUser).toHaveProperty("firstName", "Updated");
      expect(updatedUser).toHaveProperty("lastName", "Name");
      expect(updatedUser).toHaveProperty("email", userData.email);
    });

    it("🚫 should fail with invalid token", async () => {
      const mockReq = {
        headers: {
          authorization: "Bearer fake.token.value",
        },
        body: {
          firstName: "Hack",
          lastName: "Attempt",
        },
      };

      await expect(userService.updateUserProfile(mockReq)).rejects.toThrow();
    });

    it("🚫 should fail if token is missing", async () => {
      const mockReq = {
        headers: {},
        body: {
          firstName: "No",
          lastName: "Token",
        },
      };

      await expect(userService.updateUserProfile(mockReq)).rejects.toThrow();
    });
  });
});
