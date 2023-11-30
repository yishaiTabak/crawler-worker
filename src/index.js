const express = require('express');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json());

const router = require('./router')
app.use(router)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});