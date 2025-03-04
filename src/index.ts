import express, { Request, Response } from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const TABLE_NAME = 'general';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamoDB = DynamoDBDocumentClient.from(client);

app.post('/insert', async (req: Request, res: Response): Promise<any> => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Os campos key e value são obrigatórios.' });
  }

  const params = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      Key: key,
      Value: value,
    },
  });

  try {
    await dynamoDB.send(params);
    return res.json({ message: 'Item inserido com sucesso!', item: { Key: key, Value: value } });
  } catch (error) {
    console.error('Erro ao inserir item:', error);
    return res.status(500).json({ error: 'Erro ao inserir item no DynamoDB' });
  }
});

app.get('/get/:key', async (req: Request, res: Response): Promise<any> => {
  const { key } = req.params;

  const params = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      Key: key,
    },
  });

  try {
    const result = await dynamoDB.send(params);

    if (!result.Item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    return res.json({ item: result.Item });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return res.status(500).json({ error: 'Erro ao buscar item no DynamoDB' });
  }
});

app.listen(3333, () => console.log('Server running on port 3333'));
