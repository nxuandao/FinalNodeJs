const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../Models/Product");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    //Lấy sản phẩm quần áo từ DB
    const clothes = await Product.find({
      producttype: { $regex: "clothing|shirt|pant|dress|áo|quần|váy", $options: "i" }
    })
      .select("_id name price images colors sizes slug")
      .limit(8);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Bạn là một tư vấn viên thời trang.
Hãy trả lời tự nhiên, thân thiện giống như đang chat với khách.

 QUY TẮC TRẢ LỜI:
1. Nếu khách hỏi về quần áo, phối đồ, chọn size, màu → 
   - Hãy tư vấn thật tự nhiên
   - Có thể đề xuất 1–3 sản phẩm từ danh sách dưới đây
   - KHÔNG ĐƯỢC tự bịa sản phẩm ngoài danh sách.

2. Chỉ được dùng sản phẩm từ danh sách sau:
${JSON.stringify(
  clothes.map(p => ({
    name: p.name,
    price: p.price,
    colors: p.colors,
    sizes: p.sizes,
    image: p.images?.[0] || ""
  })),
  null,
  2
)}

3. Nếu câu hỏi KHÔNG liên quan đến thời trang → trả lời ngắn gọn, thân thiện.

4. Luôn trả lời dạng văn bản bình thường (not JSON).

---
Khách: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.json({ type: "text", reply });

  } catch (err) {
    console.error(" Gemini Clothing Chat Error:", err);
    return res.status(500).json({ error: "Chat AI failed" });
  }
});

module.exports = router;
