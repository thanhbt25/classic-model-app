const API_BASE = "http://127.0.0.1:8000/api";

// ==================== BIỂU ĐỒ DOANH THU THEO THÁNG ====================
async function loadSalesChart() {
    try {
        const res = await fetch(`${API_BASE}/statistics/revenue-by-month`);
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu doanh thu theo tháng");
        const data = await res.json();

        const labels = data.map(d => d.label);
        const revenues = data.map(d => d.revenue);

        const ctx = document.getElementById("salesChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Doanh thu ($)",
                    data: revenues,
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `$${ctx.parsed.y.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: v => `$${(v / 1000).toFixed(0)}K`
                        }
                    },
                    x: { ticks: { maxRotation: 45 } }
                }
            }
        });
    } catch (err) {
        console.error("salesChart error:", err);
        document.getElementById("salesChart").insertAdjacentHTML(
            "afterend",
            `<p class="text-danger">Không thể tải biểu đồ doanh thu: ${err.message}</p>`
        );
    }
}

// ==================== BIỂU ĐỒ TỶ TRỌNG DANH MỤC ====================
async function loadCategoryChart() {
    try {
        const res = await fetch(`${API_BASE}/statistics/revenue-by-category`);
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu danh mục");
        const data = await res.json();

        const labels = data.map(d => d.category);
        const revenues = data.map(d => d.revenue);
        const colors = [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
            "#9966FF", "#FF9F40", "#C9CBCF"
        ];

        const ctx = document.getElementById("categoryChart").getContext("2d");
        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: revenues,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: $${ctx.parsed.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("categoryChart error:", err);
    }
}

// ==================== PIVOT TABLE ====================
async function loadPivotTable() {
    const container = document.getElementById("pivotTable");
    try {
        const res = await fetch(`${API_BASE}/statistics/pivot-data`);
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu pivot");
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = "<p class='text-warning'>Không có dữ liệu để hiển thị.</p>";
            return;
        }

        // Dùng jQuery PivotTable
        $(container).pivotUI(data, {
            rows: ["country"],
            cols: ["productLine"],
            vals: ["revenue"],
            aggregatorName: "Sum",
            rendererName: "Table",
        });
    } catch (err) {
        console.error("pivotTable error:", err);
        container.innerHTML = `<p class="text-danger">Không thể tải Pivot Table: ${err.message}</p>`;
    }
}

// ==================== KHỞI CHẠY ====================
document.addEventListener("DOMContentLoaded", () => {
    loadSalesChart();
    loadCategoryChart();
    $(document).ready(function() {
        console.log("DOM đã sẵn sàng, bắt đầu load Pivot...");
        loadPivotTable();
    });
});
