import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Đường dẫn tới thư mục chứa web

// API kiểm tra user Roblox
app.get("/api/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });

    const data = await response.json();
    if (!data.data || data.data.length === 0)
      return res.status(404).json({ error: "Không tìm thấy người dùng Roblox này!" });

    const user = data.data[0];
    const userId = user.id;

    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();
    const avatar = avatarData.data?.[0]?.imageUrl || null;

    const infoRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const info = await infoRes.json();

    res.json({
      id: userId,
      username: user.name,
      displayName: user.displayName,
      description: info.description || "Không có mô tả",
      created: info.created,
      avatar,
      link: `https://www.roblox.com/users/${userId}/profile`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server!", details: err.message });
  }
});

// Render yêu cầu PORT môi trường
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy: http://localhost:${PORT}`));
