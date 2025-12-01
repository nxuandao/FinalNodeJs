import { useState, useEffect } from "react";
import { sendMessage } from "./lib/gemini";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Load vị trí từ localStorage
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem("chat-pos");
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 90, y: window.innerHeight - 120 };
  });

  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragging(true);
    setMoved(false);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const dx = Math.abs(e.clientX - startPos.x);
    const dy = Math.abs(e.clientY - startPos.y);

    if (dx > 5 || dy > 5) {
      setMoved(true);
      const newPos = { x: e.clientX - 30, y: e.clientY - 30 };
      setPos(newPos);
      localStorage.setItem("chat-pos", JSON.stringify(newPos));
    }
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  async function handleSend() {
    if (!input.trim()) return;

    setMessages(m => [...m, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    const reply = await sendMessage(input);

    setIsTyping(false);
    setMessages(m => [...m, { sender: "bot", text: reply }]);
  }

  return (
    <>
     
      {!open && (
        <div
          onMouseDown={handleMouseDown}
          onClick={() => !moved && setOpen(true)}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #111, #444)",
            color: "#fff",
            fontSize: 28,
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, .5)",
            transition: dragging ? "none" : ".15s",
            zIndex: 9999
          }}>
          🛍️
        </div>
      )}

      
      {open && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 360,
          background: "#111",
          borderRadius: 16,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
          zIndex: 9999,
          maxHeight: 520,
          overflow: "hidden",
          border: "1px solid #222"
        }}>

          {/* Header */}
          <div style={{
            background: "#000",
            padding: "14px 16px",
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 16,
            borderBottom: "1px solid #222"
          }}>
            🛒 Hỗ trợ thời trang
            <button
              onClick={() => setOpen(false)}
              style={{
                fontSize: 22,
                border: "none",
                background: "none",
                color: "#aaa",
                cursor: "pointer"
              }}
            >✖</button>
          </div>

          {/* MESSAGE AREA */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "#fff"
          }}>

            {messages.length === 0 && (
              <div style={{
                textAlign: "center",
                color: "#777",
                paddingTop: 25,
                fontStyle: "italic"
              }}>
                👗 Chào bạn! Mình có thể tư vấn size, phối đồ hoặc gợi ý sản phẩm phù hợp nhé.
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left" }}>
                <div style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: m.sender === "user" ? "#333" : "#1a1a1a",
                  color: "#eee",
                  maxWidth: "80%",
                  border: "1px solid #222",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, .4)"
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                background: "#1a1a1a",
                width: "fit-content",
                padding: "8px 14px",
                borderRadius: 10,
                color: "#aaa",
                fontSize: 13,
                border: "1px solid #222"
              }}>
                Đang nhập...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div style={{ padding: 12, background: "#fff", borderTop: "1px solid #222" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi về thời trang..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #333",
                background: "#111",
                color: "#fff",
                outline: "none"
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button onClick={handleSend} style={{
              marginTop: 10,
              padding: 11,
              background: "#333",
              color: "#fff",
              borderRadius: 8,
              border: "1px solid #444",
              width: "100%",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(0,0,0,0.4)"
            }}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
