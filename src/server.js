const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Tách xử lý socket ra file riêng
require("./socket")(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
