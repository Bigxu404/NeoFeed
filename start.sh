#!/bin/bash

# NeoFeed 启动脚本

echo "🚀 启动 NeoFeed..."

# 检查数据库
if [ ! -f "database/neofeed.db" ]; then
    echo "📦 初始化数据库..."
    cd database
    python init_db.py
    cd ..
fi

# 启动后端
echo "🔧 启动后端 API..."
cd /Users/Zhuanz/NeoFeed
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端..."
cd web
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ NeoFeed 启动成功！"
echo ""
echo "📍 前端地址: http://localhost:3000"
echo "📍 后端地址: http://localhost:8000"
echo "📍 API 文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待进程
wait $BACKEND_PID $FRONTEND_PID

