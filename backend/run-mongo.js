const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'ecommerce'
      }
    });
    console.log(`🚀 In-Memory MongoDB running on ${mongoServer.getUri()}`);
    
    // Keep process alive
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error(error);
  }
})();
