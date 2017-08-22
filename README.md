# Cardiophylla

Cardiophylla is an application that allows users to make plans of gardens - as map or view (photo).

## Start
`npm start`

# Environment Variables
| Name            | Description                                                                    | Required |
|-----------------|--------------------------------------------------------------------------------|----------|
| PORT            | The port on which the application runs                                         | Defaults to 3000 |
| MONGODB_URI     | The MongoDB-URI in the form mongodb://<username>:<password>@host:port/database | Yes |
| JWT_SECRET      | The (static) JWT secret                                                        | Defaults to a random value that is set when the server is started |

## License
Cardiophylla is published under the MIT license.