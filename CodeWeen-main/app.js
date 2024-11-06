const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = 'seu_segredo_aqui';

// Conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gameoftheyear'
});

// Função para conectar ao banco
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).send('Erro no servidor.');

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(400).send('Email ou senha inválidos!');
        }

        const token = jwt.sign(
            { id: results[0].id, email: results[0].email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            name: results[0].name,
            photo: results[0].photo,
        });
    });
});

// Middleware para autenticação de token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Rota para registro de usuários
app.post('/register', async (req, res) => {
    const { email, password, name, photo } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
        if (err) return res.status(500).send('Erro no servidor.');
        if (result.length > 0) {
            return res.status(400).send('Usuário já existe!');
        }

        db.query('INSERT INTO users (email, password, name, photo) VALUES (?, ?, ?, ?)', 
            [email, hashedPassword, name, photo], (err, result) => {
            if (err) return res.status(500).send('Erro no servidor.');
            res.status(201).send('Usuário registrado com sucesso');
        });
    });
});

// Atualizar dados do usuário
app.put('/user', authenticateToken, async (req, res) => {
    const { newName, newPhoto } = req.body;

    db.query('UPDATE users SET name = ?, photo = ? WHERE id = ?', [newName, newPhoto, req.user.id], (err, result) => {
        if (err) return res.status(500).send('Erro ao atualizar usuário.');
        res.send('Usuário atualizado com sucesso');
    });
});

// Registrar resultado do jogo
app.post('/game-result', authenticateToken, (req, res) => {
    const { result } = req.body;
    const userId = req.user.id;

    let query = '';
    if (result === 'win') {
        query = 'UPDATE users SET victories = victories + 1 WHERE id = ?';
    } else if (result === 'lose') {
        query = 'UPDATE users SET defeats = defeats + 1 WHERE id = ?';
    } else {
        return res.send('Empate registrado!');
    }

    db.query(query, [userId], (err) => {
        if (err) return res.status(500).send('Erro ao registrar resultado.');
        res.send(result === 'win' ? 'Vitória registrada!' : 'Derrota registrada!');
    });
});

// Rota para obter histórico de vitórias/derrotas
app.get('/user-stats', authenticateToken, (req, res) => {
    db.query('SELECT victories, defeats FROM users WHERE id = ?', [req.user.id], (err, result) => {
        if (err) return res.status(500).send('Erro ao buscar estatísticas.');
        if (result.length === 0) return res.status(404).send('Usuário não encontrado');
        res.json(result[0]);
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
