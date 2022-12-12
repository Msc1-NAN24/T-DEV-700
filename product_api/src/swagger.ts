import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app"];
const config = {};
swaggerAutogen(outputFile, endpointsFiles, config);
