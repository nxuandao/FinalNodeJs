export function parseVND(val) {
    if (typeof val === "number" && Number.isFinite(val)) return Math.round(val);
    if (typeof val === "string") {
        const digits = val.replace(/[^\d]/g, "");
        return Number(digits || 0);
    }
    return 0;
}

export function fmtVND(n) {
    return new Intl.NumberFormat("vi-VN").format(parseVND(n));
}
