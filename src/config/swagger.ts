import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nova Health API',
      version: '1.0.0',
      description: 'Nova Health Clinic Management System Backend REST API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Patients', description: 'Patient record management' },
      { name: 'Appointments', description: 'Appointment scheduling & management' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your bearer token',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/routes/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
