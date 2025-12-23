#!/bin/bash

# NeoFeed 数据库快速启动脚本
# 一键完成：初始化 → 插入测试数据 → 运行测试

echo "=========================================="
echo "🚀 NeoFeed 数据库快速启动"
echo "=========================================="

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python3，请先安装"
    exit 1
fi

echo ""
echo "📦 步骤 1/3: 初始化数据库..."
python3 init_db.py

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

echo ""
echo "📝 步骤 2/3: 插入测试数据..."
python3 test_data.py

if [ $? -ne 0 ]; then
    echo "❌ 测试数据插入失败"
    exit 1
fi

echo ""
echo "🧪 步骤 3/3: 运行查询测试..."
python3 test_queries.py

if [ $? -ne 0 ]; then
    echo "❌ 查询测试失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 数据库准备完成！"
echo "=========================================="
echo ""
echo "📁 数据库文件: neofeed.db"
echo ""
echo "💡 下一步你可以："
echo "   1. 使用 DB Browser 打开 neofeed.db 查看数据"
echo "   2. 在你的应用代码中连接这个数据库"
echo "   3. 准备好后运行 python3 migrate_to_postgres.py 迁移到生产环境"
echo ""

