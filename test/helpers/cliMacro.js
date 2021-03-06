import beforeEach from "./beforeEach";
import child from "child_process";
import { cliPath } from "../fixtures";
import getCurrCommitHash from "./getCurrCommitHash";
import getCurrTagHash from "./getCurrTagHash";
import getCurrTree from "./getCurrTree";
import getCurrVersion from "./getCurrVersion";
import tempInitAndVersion from "./tempInitAndVersion";

export default async (t, params, expectedVersion, expectedTree) => {
	beforeEach(t);
	delete process.env.npm_lifecycle_event;
	tempInitAndVersion();

	const versionProcess = child.spawnSync(
		cliPath,
		[].concat(params).filter(Boolean),
		{
			env: Object.assign({}, process.env, {
				RNV_ENV: "ava"
			})
		}
	);

	if (versionProcess.status > 0) {
		throw new Error(versionProcess.stderr.toString());
	}

	t.deepEqual(getCurrVersion(t), expectedVersion);
	t.deepEqual(await getCurrTree(t), expectedTree);

	if (params.indexOf("--skip-tag") > -1) {
		t.not(await getCurrTagHash(t), await getCurrCommitHash(t));
	} else {
		t.is(await getCurrTagHash(t), await getCurrCommitHash(t));
	}
};
