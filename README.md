# Cardiophylla

Cardiophylla is an application that allows users to make plans of gardens - as map or view (photo).

## Start
`npm start`

# Environment Variables
| Name            | Description | Required |
|-----------------|-------------|----------|
| `PORT` | The port on which the application runs | No, defaults to 3000 |
| `MONGODB_URI` | The MongoDB-URI in the form mongodb://&lt;username&gt;:&lt;password&gt;@&lt;host&gt;:&lt;port&gt;/&lt;database&gt; | Yes |
| `JWT_SECRET` | The (static) JWT secret | No, defaults to a random value that is set when the server is started |

## License
Cardiophylla is published under the MIT license.