# LightRAG 集成方案（存档）

> 存档日期：2026-01-30
> 状态：待启动（建议文章量达到 200+ 后再评估）

## 一、项目概述

[LightRAG](https://github.com/HKUDS/LightRAG) 是香港大学开源的 RAG 框架（28k+ Star），用知识图谱替代传统向量检索，实现跨文档关联推理和自然语言知识检索。

**与 NeoFeed 的结合点：**
1. 跨文章知识关联：自动从文章中提取实体和关系，构建知识图谱
2. 自然语言知识检索：对话式查询积累的所有文章内容
3. 知识星系可视化升级：用实体关系数据驱动 3D 图谱
4. 更智能的周报：基于全局知识图谱生成跨文章趋势洞察

## 二、架构设计

```
用户提交 URL
    ↓
NeoFeed (Next.js)
    ├── Inngest: 抓取内容 → 存入 content_raw
    ├── Inngest: 调火山引擎 → 生成摘要/标签
    └── Inngest: 调 LightRAG API → 插入文档，构建知识图谱  ← 新增

用户提问 "哪些文章讨论了 Agent 基础设施"
    ↓
NeoFeed API Route → fetch LightRAG /query → 返回关联文章和实体关系
```

## 三、所需资源

### 已有（可复用）
- 火山引擎 Seed API（LLM，用于实体/关系提取 + 查询回答）
- Supabase PostgreSQL（NeoFeed 业务数据）

### 需新准备
1. **Embedding 模型 API**
   - 推荐：SiliconFlow `BAAI/bge-m3`（免费）
   - 备选：火山引擎方舟平台文本向量化 API
   - API 地址：`https://api.siliconflow.cn/v1`
   - 向量维度：1024

2. **Docker 环境**（本地或云服务器）
   - 最低配置：2C4G，20GB 磁盘

## 四、部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/HKUDS/LightRAG.git
cd LightRAG

# 2. 配置环境变量
cp env.example .env
```

`.env` 关键配置：
```bash
# LLM（火山引擎）
LLM_MODEL=doubao-seed-1-8-251228
LLM_BINDING=openai
LLM_BINDING_HOST=https://ark.cn-beijing.volces.com/api/v3
LLM_API_KEY=<你的火山引擎API_Key>

# Embedding（SiliconFlow）
EMBEDDING_MODEL=BAAI/bge-m3
EMBEDDING_BINDING=openai
EMBEDDING_BINDING_HOST=https://api.siliconflow.cn/v1
EMBEDDING_API_KEY=<你的SiliconFlow_API_Key>
EMBEDDING_DIM=1024

# 服务
HOST=0.0.0.0
PORT=9621
```

```bash
# 3. 启动
docker compose up -d

# 4. 验证
curl http://localhost:9621/health
```

## 五、NeoFeed 对接的 API 接口

### 插入文档（每次抓取文章后调用）
```
POST http://localhost:9621/documents/text
Content-Type: application/json

{
  "text": "文章全文...",
  "metadata": { "source": "url", "title": "标题", "feed_id": "xxx" }
}
```

### 自然语言查询
```
POST http://localhost:9621/query
Content-Type: application/json

{
  "query": "哪些文章讨论了 Agent 基础设施",
  "mode": "mix"
}
```

### 删除文档
```
DELETE http://localhost:9621/documents/{doc_id}
```

### 知识图谱数据（可视化用）
```
GET http://localhost:9621/graphs?label=*
```

## 六、开发计划（5 个阶段，约 7-11 天）

| 阶段 | 内容 | 时间 |
|------|------|------|
| 1. 基础验证 | Docker 部署 + 手动测试插入/查询 | 1-2 天 |
| 2. 后端对接 | 新建 lib/lightrag.ts + Inngest 流程 + API Route | 1-2 天 |
| 3. 检索 UI | KnowledgeSearch 组件 + 集成到 Workbench | 2-3 天 |
| 4. 可视化升级 | 实体关系驱动 Galaxy 3D 图谱 | 2-3 天 |
| 5. 周报增强 | LightRAG global 模式注入周报 prompt | 1 天 |

## 七、成本估算（个人使用）

| 场景 | 月成本 |
|------|-------|
| 轻度（3 篇/天 + 3 次查询） | ¥3-8 |
| 中度（5 篇/天 + 5 次查询） | ¥8-20 |
| 重度（10 篇/天 + 10 次查询） | ¥15-40 |

## 八、启动条件

建议满足以下条件后启动：
- [ ] NeoFeed 文章量达到 200+
- [ ] 基础功能（抓取、格式、UI）稳定
- [ ] 出现"找不到之前看过的文章"的痛点
- [ ] 需要跨文章的主题分析能力
