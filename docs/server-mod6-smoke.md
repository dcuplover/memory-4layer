# Server Smoke Test For MOD6

This guide verifies only MOD6 registration paths:
- tool registration (`registerTools`)
- cli registration (`registerCli`)

It does not validate full memory storage/retrieval behavior.

## Option A: Deploy via Git (recommended)

### Local machine

```bash
git add package.json test/mod6-registration.test.ts scripts/mod6-smoke.sh docs/server-mod6-smoke.md
git commit -m "test: add MOD6 registration smoke tests and server runner"
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
