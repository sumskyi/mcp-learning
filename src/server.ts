import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const server = new McpServer({
  name: "mcp-learning",
  version: "0.1.0",
});

/*
|--------------------------------------------------------------------------
| Tools
|--------------------------------------------------------------------------
|
| Тут будуть підключатися tools.
|
| import "./tools/echo.js";
| import "./tools/read-file.js";
|
*/
import "./tools/index.js";

/*
|--------------------------------------------------------------------------
| Resources
|--------------------------------------------------------------------------
|
| Тут будуть реєструватися resources.
|
| import "./resources/today.js";
|
*/
import "./resources/index.js";

/*
|--------------------------------------------------------------------------
| Prompts
|--------------------------------------------------------------------------
|
| Тут будуть реєструватися prompts.
|
| import "./prompts/review.js";
|
*/
import "./prompts/index.js";

