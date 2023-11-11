import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const codeString = `openapi: "3.0.0"
info:
  version: 1.0.0
  title: My API
servers:
  - url: http://localhost:8080
paths:
  /inference/batch:
    post:
      summary: Make a batch inference
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: The file to be uploaded
                model:
                  $ref: '#/components/schemas/Model'
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    type: string
  /inference/single:
    post:
      summary: Make a single inference
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                non_target_columns:
                  type: array
                  items:
                    type: string
                user_input_values:
                  type: object
                model:
                  $ref: '#/components/schemas/Model'
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: object
                properties:
                  prediction:
                    type: string
components:
  schemas:
    Model:
      type: object
      properties:
        model_id:
          type: string
        output_mapping:
          type: array
          items:
            type: string
        saved_model_pth:
          type: string
        input_schema:
          type: array
          items:
            type: object
            properties:
              column_name:
                type: string
              column_type:
                type: string
            required:
              - column_name
              - column_type`;

function MyComponent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <SyntaxHighlighter language="yaml" style={solarizedlight}>
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

export default MyComponent;