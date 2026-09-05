const { execSync, spawn } = require('child_process');

async function createSecret(name, value) {
  console.log(`Setting up secret: ${name}...`);
  try {
    execSync(`gcloud secrets create ${name} --replication-policy=automatic --project=life-observatory-507712`, { stdio: 'pipe' });
    console.log(`Secret ${name} created.`);
  } catch (err) {
    console.log(`Secret ${name} already exists or error:`, err.message.slice(0, 100));
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('gcloud', ['secrets', 'versions', 'add', name, '--data-file=-', '--project=life-observatory-507712'], { shell: true });
    proc.stdin.write(value);
    proc.stdin.end();

    proc.stdout.on('data', d => console.log(d.toString()));
    proc.stderr.on('data', d => console.error(d.toString()));
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to add version to ${name} (exit code ${code})`));
    });
  });
}

async function run() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!clientSecret || !geminiApiKey) {
    console.log('Provide GOOGLE_CLIENT_SECRET and GEMINI_API_KEY via environment variables to provision Secret Manager.');
    return;
  }

  await createSecret('GOOGLE_CLIENT_SECRET', clientSecret);
  await createSecret('GEMINI_API_KEY', geminiApiKey);
  console.log('Secrets setup complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
