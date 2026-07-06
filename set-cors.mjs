import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = 'tienda-de-ropa-35bea.firebasestorage.app';

async function setCors() {
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      origin: ['*'],
      responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'Range']
    }
  ]);
  console.log('¡Reglas CORS actualizadas con éxito en Firebase Storage!');
}

setCors().catch(console.error);
