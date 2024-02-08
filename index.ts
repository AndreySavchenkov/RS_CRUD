import * as http from "http";
import * as url from "url";

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
        id: String(users.length + 1),
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

const getAllUsers = (req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ users: users }));
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "", true);
  const { pathname } = parsedUrl;

  if (pathname === "/api/users" && req.method === "GET") {
    getAllUsers(req, res);
  } else if (pathname === "/api/users" && req.method === "POST") {
    createUser(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Error 404: non-existing endpoint");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
