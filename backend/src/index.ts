import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// O CORS permite que o seu Frontend (que vai rodar na porta 3000)
// consiga fazer requisições para este Backend (porta 3001) sem ser bloqueado.
app.use(cors());
app.use(express.json());

// Equivalente a um @GetMapping("/api/weather/:country") no Spring Boot
app.get('/api/weather/:country', async (req: Request, res: Response) => {
    const country = req.params.country;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        // Chamada para a API externa (usando o axios no lugar do RestTemplate do Java)
        const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${country}&aqi=no`);
        
        // Devolvemos apenas os dados que importam para o Front-end
        res.json({
            country: response.data.location.country,
            temp_c: response.data.current.temp_c,
            condition: response.data.current.condition.text,
            icon: response.data.current.condition.icon
        });

    } catch (error: any) {
        // Tratamento de erro básico exigido no teste
        console.error("Erro ao buscar clima:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Back-end rodando na porta ${PORT}`);
});