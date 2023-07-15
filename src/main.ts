import "dotenv/config";
import * as fs from "node:fs/promises";
import got from "got";
import chokidar from "chokidar";
import { z } from "zod";

const env = z
	.object({
		TARGET_FILE_PATH: z.string(),
		REQUEST_ENDPOINT: z.string().url(),
		REQUEST_METHOD: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
	})
	.parse(process.env);

const send = async (data: string) => {
	await got(env.REQUEST_ENDPOINT, {
		method: env.REQUEST_METHOD,
		body: data,
	});
};

const handleChange = async () => {
	try {
		const data = await fs.readFile(env.TARGET_FILE_PATH, "utf-8");
		console.log("File changed:", data);
		await send(data);
	} catch (error) {
		console.error(error);
	}
};

const watcher = chokidar.watch(env.TARGET_FILE_PATH, { disableGlobbing: true });

watcher.on("add", handleChange);
watcher.on("change", handleChange);
