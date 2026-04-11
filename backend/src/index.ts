// backend/src/index.ts
// Ponto de entrada do servidor Express

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// --- Configuração ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rotas ---

// GET /api/weather/:country
// Busca o clima atual de um país via WeatherAPI e retorna apenas os campos usados pelo frontend
app.get('/api/weather/:country', async (req: Request, res: Response) => {
    const country = req.params.country;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        const response = await axios.get(
            `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${country}&aqi=no`
        );

        res.json({
            country: response.data.location.country,
            temp_c: response.data.current.temp_c,
            condition: response.data.current.condition.text,
            icon: response.data.current.condition.icon,
        });

    } catch (error: any) {
        console.error('Erro ao buscar clima:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
});

// --- Inicialização ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor Back-end rodando na porta ${PORT}`);
});