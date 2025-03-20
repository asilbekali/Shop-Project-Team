const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Shop API",
      version: "1.0.0",
      description: "Online Shop API documentation with Swagger",
    },
    servers: [
      {
        url: "http://localhost:3002",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "index.js"],
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at http://localhost:3002/api-docs");
};

module.exports = swaggerDocs;
