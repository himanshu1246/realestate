const { execSync, spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  console.log("\n🚀 Vrundavan Website Apache Deployment Utility\n");

  // Step 1: Run production build
  console.log("📦 Step 1: Running production build...");
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Production build completed successfully.\n");
  } catch (error) {
    console.error("❌ Build failed! Please fix build errors before deploying.");
    process.exit(1);
  }

  // Step 2: Gather Server Details
  console.log("🖥️ Step 2: Configuring SSH/SFTP Connection...");
  const host = await question("🔹 Enter server host/IP address: ");
  if (!host.trim()) {
    console.error("❌ Host is required.");
    process.exit(1);
  }

  const username = (await question("🔹 Enter SSH username (default: ubuntu): ")) || "ubuntu";
  const remotePath = (await question("🔹 Enter remote web path (default: /var/www/html/): ")) || "/var/www/html/";
  
  const authMethod = (await question("🔹 Auth method - SSH Key or Password? (key/password, default: key): ")).toLowerCase() || "key";

  let keyPath = "";
  if (authMethod.includes("key")) {
    keyPath = await question("🔹 Enter absolute path to your SSH private key (e.g., C:\\path\\to\\key.pem): ");
    if (!keyPath.trim()) {
      console.warn("⚠️ No key path provided. Standard default keys (e.g. ~/.ssh/id_rsa) will be used.");
    } else {
      keyPath = keyPath.replace(/['"]/g, "").trim(); // Remove quotes if dragged/dropped
    }
  }

  console.log("\n📤 Step 3: Deploying files to server...");

  // Formulate base SSH/SCP options
  const sshOpts = keyPath ? `-i "${keyPath}"` : "";
  const connectionStr = `${username}@${host}`;

  // Command to rename default index.html and set up directory
  console.log(`\n🧹 Preparing web directory: ${remotePath}...`);
  const renameCmd = `ssh ${sshOpts} ${connectionStr} "if [ -f ${remotePath}/index.html ] && ! grep -q 'Vrundavan' ${remotePath}/index.html; then sudo mv ${remotePath}/index.html ${remotePath}/old-index.html && echo 'Renamed default index.html to old-index.html'; else echo 'No default index.html found or already updated'; fi"`;

  try {
    execSync(renameCmd, { stdio: "inherit" });
  } catch (err) {
    console.warn("⚠️ Could not rename default index.html remotely (this is normal if it doesn't exist, permissions are restricted, or it is a password auth).");
  }

  // Command to upload the dist folder contents
  console.log(`\n⬆️ Uploading dist/ contents to ${connectionStr}:${remotePath}...`);
  
  // Clean dist path formatting for Windows
  const localDistPath = path.join(process.cwd(), "dist", "*");
  const uploadCmd = `scp ${sshOpts} -r "${localDistPath}" "${connectionStr}:${remotePath}"`;

  try {
    console.log(`Running: ${uploadCmd}\n`);
    execSync(uploadCmd, { stdio: "inherit" });
    console.log("\n✅ Files uploaded successfully!");
  } catch (err) {
    console.error("\n❌ Upload failed! Double-check host IP, username, key path, or network connection.");
    console.error(err.message);
    rl.close();
    process.exit(1);
  }

  // Step 4: Fix Remote Permissions
  console.log("\n🔑 Step 4: Setting correct file permissions for Apache (www-data)...");
  const permissionCmd = `ssh ${sshOpts} ${connectionStr} "sudo chown -R www-data:www-data ${remotePath} && sudo find ${remotePath} -type d -exec chmod 755 {} \\; && sudo find ${remotePath} -type f -exec chmod 644 {} \\;"`;

  try {
    execSync(permissionCmd, { stdio: "inherit" });
    console.log("✅ Permissions fixed successfully (www-data:www-data, 755/644).");
  } catch (err) {
    console.warn("⚠️ Permissions command failed. You may need to run this manually on the server:");
    console.log(`   sudo chown -R www-data:www-data ${remotePath}`);
    console.log(`   sudo find ${remotePath} -type d -exec chmod 755 {} \\;`);
    console.log(`   sudo find ${remotePath} -type f -exec chmod 644 {} \\;`);
  }

  console.log("\n🎉 Deployment completed successfully! Visit http://" + host + " to view your live website.");
  rl.close();
}

run().catch((err) => {
  console.error(err);
  rl.close();
});
