import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:4000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Game state management with Socket.io
io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-game', (gameId: string) => {
    socket.join(gameId);
    // Handle game logic
  });
  
  interface BetData {
    gameId: string;
    userId: string;
    amount: number;
    selection: string | number;
  }
  
  socket.on('place-bet', (data: BetData) => {
    // Handle betting logic
    io.to(data.gameId).emit('bet-placed', {
      userId: data.userId,
      amount: data.amount,
      selection: data.selection
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});