import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API kiểm tra thông tin Roblox user
app.get("/api/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: "Thiếu tên người dùng!" });

    // Gửi yêu cầu tới Roblox API
    const userResp = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });

    const userData = await userResp.json();

    // Nếu không tìm thấy user
    if (!userData.data || userData.data.length === 0)
      return res.status(404).json({ error: "Không tìm thấy người dùng Roblox này!" });

    const user = userData.data[0];
    const userId = user.id;

    // Lấy avatar
    const avatarResp = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarResp.json();
    const avatarUrl = avatarData?.data?.[0]?.imageUrl || "";

    // Lấy thông tin chi tiết
    const infoResp = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const infoData = await infoResp.json();

    res.json({
      id: userId,
      username: user.name,
      displayName: user.displayName,
      description: infoData.description || "Không có mô tả",
      created: infoData.created,
      avatar: avatarUrl,
      link: `https://www.roblox.com/users/${userId}/profile`,
    });
  } catch (err) {
    console.error("❌ Lỗi API Roblox:", err);
    res.status(500).json({ error: "Lỗi server Roblox!", details: err.message });
  }
});

// Render dùng PORT môi trường
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`));
