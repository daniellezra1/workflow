const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const boardRoutes = require('./api/board/board.routes.js');
const connectSockets = require('./api/socket/socket.routes.js');

app.use(cookieParser());
app.use(bodyParser.json());

// app.use(bodyParser.json({ limit: '110kb' }));
// app.use(bodyParser.urlencoded({ limit: '110kb', extended: false, parameterLimit: 1000000 }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')));
} else {
    const corsOptions = {
        origin: ['http://192.168.1.28:8080', 'http://localhost:8080', 'http://10.100.102.4:3000', 'http://localhost:3000', 'http://192.168.1.31:8080', 'http://10.100.102.4:8080', 'http://10.100.102.4:8081', 'http://10.100.102.5:8080', 'http://10.100.102.5:8081',' http://localhost:8081'],
        credentials: true
    };
    app.use(cors(corsOptions));
}

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes);
app.use('/api/board', boardRoutes);
connectSockets(io);


const logger = require('./services/logger.service')
const port = process.env.PORT || 3000;
http.listen(port, () => {
    logger.info('Server is running on port: ' + port);
    console.log('Server is running on port: ' + port);
});