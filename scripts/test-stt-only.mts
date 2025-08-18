import assert from "node:assert";
import { readFileSync } from "node:fs";

// Load .env.local
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const [key, ...valueParts] = line.split('=');
        return [key, valueParts.join('=')];
      })
  );
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
} catch (error) {
  console.warn('Could not load .env.local:', error);
}

async function testSTT() {
  console.log("Testing STT with WhisperX...");
  
  const res = await fetch("http://localhost:3000/api/audio/stt", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: "https://filesamples.com/samples/audio/wav/sample1.wav",
      modelKey: "whisperx:base"
    }),
  });

  console.log(`Status: ${res.status}`);
  const text = await res.text();
  console.log("Response:", text);
  
  if (res.ok) {
    const json = JSON.parse(text);
    if (json.ok) {
      console.log("✅ STT test passed!");
      console.log("Transcription:", json.data?.text);
    } else {
      console.log("❌ STT failed:", json.error);
    }
  } else {
    console.log("❌ HTTP error:", res.status);
  }
}

testSTT().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
