This is a clean, professional, and high-tech `README.md` for your GitHub repository. It reflects the **iWrap** brand and the **Rasail** industrial design aesthetic.

***

# 📟 iWrap 2025
### Unpack your 2025 Instagram footprint with industrial precision.

![Version](https://img.shields.io/badge/Version-2.0.4-emerald)
![License](https://img.shields.io/badge/License-MIT-black)
![React](https://img.shields.io/badge/Framework-React_18-61DAFB)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC)

**iWrap** is a high-performance, privacy-focused web application that transforms your raw Instagram data export into a cinematic "Wrapped" experience. Built with a sharp, industrial aesthetic (Rasail Design Language), it analyzes your messages, likes, and stories locally in your browser.

---

## 🚀 Key Features

- **Industrial UI:** A premium "Rasail" dark mode aesthetic with technical grid overlays and emerald accents.
- **Message Intelligence:** Calculates total throughput, sent vs. received ratios, and top DM nodes (filtering out group chats).
- **Temporal Analysis:** Estimates total "Life-Time Spent" based on a 5-second per message latency protocol.
- **Interaction Metrics:** 
  - **Story Likes:** Total likes and top users you've interacted with.
  - **Post Likes:** Analytics for media engagement.
  - **Broadcasts:** Total number of stories you posted in 2025.
  - **Comments:** Total count of your active participation.
- **Live Debug Terminal:** A real-time log terminal that shows the engine decompressing and analyzing your archive batches.
- **Story Protocol Export:** Generates a high-resolution, 9:16 Instagram Story summary card for social sharing.
- **Privacy First:** **Zero data ever leaves your device.** All processing is done locally in your browser's RAM.

---

## 🛠️ Tech Stack

- **Core:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Export Engine:** [html2canvas](https://html2canvas.hertzen.com/)

---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/iwrap.git
   cd iwrap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📂 How to use iWrap

1. **Download your data:**
   - Go to Instagram **Settings** -> **Accounts Center** -> **Your information and permissions** -> **Download your information**.
   - Select **"Download or transfer information"**.
   - Choose **"Some of your information"**.
   - **Crucial:** Select **JSON** format (HTML will not work).
   - Set the date range to **"Last Year"** or **"All Time"**.
2. **Unzip the file:**
   - Once Meta sends your data, download and unzip the folder.
3. **Analyze:**
   - Open **iWrap**, click **"Inject Archive"**, and select the root folder named `your_instagram_activity`.
   - Watch the **Debug Terminal** process your nodes.
   - Navigate through your 2025 recap and download your **Story Protocol**.

---

## 🔒 Privacy & Security

iWrap follows a **Zero-Knowledge Architecture**:
- It does **not** have a backend.
- It does **not** use cookies or tracking.
- Your Instagram JSON files are read using the `FileReader` API locally. When you close the tab, all data is wiped from memory.

---

## 🎨 Watermark & Credits

Developed by **[@axmed.bl](https://instagram.com/axmed.bl)**. 
Built using the **Rasail High-Scale Infrastructure** design language.

---

## ⚖️ License

MIT License - feel free to fork and build your own protocols.

*Note: iWrap is an independent project and is not affiliated with, authorized, maintained, sponsored, or endorsed by Meta or Instagram.*
