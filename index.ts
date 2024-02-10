import * as http from "http";
import * as url from "url";
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "./helpers";

type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

let users: User[] = [];

function createUser(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { username, age, hobbies } = JSON.parse(body);

      if (
        typeof username !== "string" ||
        typeof age !== "number" ||
        !Array.isArray(hobbies)
      ) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid data format");
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        age,
        hobbies,
      };

      users.push(newUser);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid JSON format");
    }
  });
}

const getUserById = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  userId: string
) => {
  const userById = users.find((user) => user.id === userId);
  if (!isValidUUID(userId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("ID is invalid");
  } else if (!userById) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("ID doesn't exist");
  } else {
    res.end(JSON.stringify(userById));
  }
};

const updateUserById = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  userId: string
) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const { username, age, hobbies } = JSON.parse(body);

      if (!isValidUUID(userId)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("ID is invalid");
        return;
      }

      if (
        typeof username !== "string" ||
        typeof age !== "number" ||
        !Array.isArray(hobbies)
      ) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid data format");
        return;
      }

      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("User not found");
        return;
      }

      users[userIndex] = {
        ...users[userIndex],
        username,
        age,
        hobbies,
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users[userIndex]));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid JSON format");
    }
  });
};

const deleteUserById = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  userId: string
) => {
  if (!isValidUUID(userId)) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("ID is invalid");
    return;
  }

  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("User not found");
    return;
  }

  users.splice(userIndex, 1);

  res.writeHead(204);
  res.end();
};

const getAllUsers = (req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ users: users }));
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "", true);
  const { pathname } = parsedUrl;
  const userId = pathname?.split("/")[3];

  if (req.method === "GET" && pathname?.startsWith("/api/users")) {
    if (userId) {
      getUserById(req, res, userId);
    } else {
      getAllUsers(req, res);
    }
  } else if (pathname === "/api/users" && req.method === "POST") {
    createUser(req, res);
  } else if (
    req.method === "PUT" &&
    pathname?.startsWith("/api/users") &&
    userId
  ) {
    updateUserById(req, res, userId);
  } else if (
    req.method === "DELETE" &&
    pathname?.startsWith("/api/users") &&
    userId
  ) {
    deleteUserById(req, res, userId);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Error 404: non-existing endpoint");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
