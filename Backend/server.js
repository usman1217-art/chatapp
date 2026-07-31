const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");
const userRoutes = require("./routes/userRoutes");

const connectDB = require("./config/db");

const dns = require("dns")
dns.setServers(["1.1.1.1","8.8.8.8"])
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const socketHandler = require("./sockets/socket");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");


connectDB();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests. Try again later."
    }
});

const app = express();
app.use(helmet());
app.use(compression());
app.use("/api/auth", limiter);


// --- UPDATED CORS CONFIGURATION ---
app.use(cors({
    origin: [
        process.env.FRONTEND_URL, // Your deployed Vercel URL
        "http://localhost:5173"   // Your local development URL
    ],
    credentials: true,
}));
// ----------------------------------

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Chat Backend Running...");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

socketHandler(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});