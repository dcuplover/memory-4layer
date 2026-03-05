# Server Smoke Test For MOD6

This guide verifies only MOD6 registration paths:
- tool registration (`registerTools`)
- cli registration (`registerCli`)

It also supports real runtime testing by enabling `registrationOnly` in plugin config.

It does not validate full memory storage/retrieval behavior.

## Option A: Deploy via Git (recommended)

### Local machine

```bash
git add package.json index.ts src/config.ts openclaw.plugin.json docs/openclaw-config-guide.md docs/server-mod6-smoke.md scripts/mod6-smoke.sh test/mod6-registration.test.ts test/registration-only-mode.test.ts
git commit -m "feat: add registrationOnly runtime mode for MOD6 registration test"
git push origin main
```

### Server machine

```bash
cd /path/to/memory-4layer
git pull --ff-only
bash scripts/mod6-smoke.sh
```

Expected result:
- `npm run build` succeeds
- `npm run test:mod6` shows all tests passed

## Real runtime test (registration only)

In your OpenClaw config, set:

```json
{
	"plugins": {
		"slots": {
			"memory": "memory-4layer"
		},
		"entries": {
			"memory-4layer": {
				"enabled": true,
				"config": {
					"registrationOnly": true,
					"embedding": {
						"apiKey": "sk-..."
					}
				}
			}
		}
	}
}
```

Then start OpenClaw normally and verify logs contain:
- `Tools 已注册`
- `CLI 已注册`
- `registrationOnly=true，已在注册步骤停止初始化`

And no logs for `MemoryStore 初始化完成` / `Retriever 初始化完成` / `Compactor 初始化完成`.

## Option B: Deploy via tarball (if server cannot access GitHub)

### Local machine

```bash
git archive --format=tar.gz -o memory-4layer-mod6.tar.gz HEAD
```

Upload with your preferred method, for example:

```bash
scp memory-4layer-mod6.tar.gz user@server:/tmp/
```

### Server machine

```bash
mkdir -p /path/to/memory-4layer
tar -xzf /tmp/memory-4layer-mod6.tar.gz -C /path/to/memory-4layer
cd /path/to/memory-4layer
bash scripts/mod6-smoke.sh
```

## Environment snapshot (optional, useful for debugging)

Run this on server and keep output:

```bash
node -v
npm -v
uname -a
```

If server results differ from local results, share:
- full `bash scripts/mod6-smoke.sh` output
- versions from the snapshot above
