# Access Exam App from Other Devices (Same WiFi)

The server is configured to listen on `0.0.0.0`, so it **should** be reachable from other devices on your network.

## Steps

### 1. Start the server
```bash
npm run dev
```
When it starts, note the **port** (usually 3000).

### 2. Find your computer's IP address
Open PowerShell or Command Prompt and run:
```bash
ipconfig
```
Find **IPv4 Address** under your WiFi adapter (e.g. `192.168.1.5`).

### 3. Open on another device
On a phone, tablet, or another laptop connected to the **same WiFi**:
- Open a browser
- Go to: `http://YOUR_IP:3000`
- Example: `http://192.168.1.5:3000`

---

## If it doesn't load: Windows Firewall

Windows Firewall may block incoming connections. Add a rule for Node.js:

### Option A: Allow Node.js through Firewall (run PowerShell as Administrator)
```powershell
New-NetFirewallRule -DisplayName "Node.js Dev Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### Option B: Allow a specific port (e.g. 3000)
```powershell
New-NetFirewallRule -DisplayName "Next.js Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Option C: Use Windows Defender Firewall GUI
1. Search "Windows Defender Firewall" → Advanced settings
2. Inbound Rules → New Rule
3. Port → TCP → Specific: **3000**
4. Allow the connection
5. Name it e.g. "Next.js Dev"

---

## Checklist
- [ ] Server running (`npm run dev`)
- [ ] Other device on same WiFi
- [ ] Using correct IP (from `ipconfig`)
- [ ] Firewall allows Node.js or port 3000
