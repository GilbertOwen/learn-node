import { app } from "./application/index.js";
import { logger } from "./application/logging.js";

app.listen(3030, () => {
    logger.info(`App can be accessed on http://localhost:3030`);
});