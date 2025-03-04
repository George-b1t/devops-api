import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const TABLE_NAME = 'general';

app.post('/insert', async (req: Request, res: Response): Promise<any> => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Os campos key e value são obrigatórios.' });
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      Key: key,
      Value: value,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: 'Item inserido com sucesso!', item: params.Item });
  } catch (error) {
    console.error('Erro ao inserir item:', error);
    res.status(500).json({ error: 'Erro ao inserir item no DynamoDB' });
  }
});

app.get('/get/:key', async (req: Request, res: Response): Promise<any> => {
  const { key } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: {
      Key: key,
    },
  };

  try {
    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ item: result.Item });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item no DynamoDB' });
  }
});

app.listen(3333, () => console.log('Server running on port 3333'));
