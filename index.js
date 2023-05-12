import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userMessageHistory = [];

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("user_connect", (data) => {
    socket.userName = data.name;
    console.log(`System user ${socket.userName} is connected`);
  });
  socket.on("disconnect", (reason) => {
    console.log(`System user ${socket.userName} is disconnected`);
  });

  socket.on("send_msg", (data) => {
    const message = { user: data.name, msg: data.msg };
    userMessageHistory.push(message);
    io.emit("new_msg", { name: data.name, msg: data.msg });
  });

  socket.on("save_messages", () => {
    const messagesJSON = userMessageHistory.map((message) => {
      return JSON.stringify(message) + "\n";
    });
    fs.writeFile("messages.txt", messagesJSON.join(""), (err) => {
      if (err) {
        console.error("Error saving messages:", err);
      } else {
        console.log("Messages saved successfully.");
      }
    });
  });
});
