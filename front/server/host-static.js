import express from 'express';
import path from'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

// Получение __filename
const __filename = fileURLToPath(import.meta.url);

// Получение __dirname
const __dirname = dirname(__filename);
const app = express();

// Настройка безопасного хостинга статических файлов
app.use(express.static(path.join(__dirname, '..', 'dist'), {
    index: false,
    dotfiles: 'ignore',
    etag: true,
    maxAge: '1d',
    setHeaders: (res, path) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    },
}));

// Отдача HTML файла при обращении к корневому URL
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

http.createServer(app).listen(8982, () => {
    console.log('HTTPS сервер запущен на порту 8982');
});
