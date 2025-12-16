import express from 'express';

const startServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();