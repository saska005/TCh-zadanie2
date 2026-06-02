const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const AUTHOR = "Sandra Zaremba"; 
app.use(express.static('app'));

app.listen(PORT, () => {
    const startupDate = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    console.log(`Data: ${startupDate}`);
    console.log(`Autor: ${AUTHOR}`);
    console.log(`Aplikacja nasłuchuje na porcie: ${PORT}`);
});