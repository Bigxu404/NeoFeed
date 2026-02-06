/**
 * 🚀 NeoFeed 数据全量重构自动化脚本
 * 
 * 原理：持续轮询 API 接口，直到所有数据处理完成。
 * 使用方法：
 * 1. 确保本地开发服务器已启动 (npm run dev)
 * 2. 在 web 目录下运行：node scripts/auto-reformat.js
 */

const API_URL = 'http://127.0.0.1:3000/api/admin/reformat-feeds';
const INTERVAL_MS = 2000; // 每次批处理后的等待时间，防止 API 频率限制

async function startAutoReformat() {
  console.log('🚀 [Automation] 启动全量数据清洗程序...');
  console.log('🔗 [Automation] 目标接口:', API_URL);
  
  let totalProcessed = 0;
  let isFinished = false;

  while (!isFinished) {
    try {
      console.log(`\n📦 [Automation] 正在请求下一批次数据 (已处理: ${totalProcessed})...`);
      
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.status === 401) {
        console.error('❌ [Automation] 身份验证失败。请确保本地环境已正确加载环境变量。');
        break;
      }

      if (data.message === '所有数据已完成重构') {
        console.log('\n✅ [Automation] 任务圆满完成！所有旧数据均已重新排版。');
        isFinished = true;
        break;
      }

      if (data.results && Array.isArray(data.results)) {
        data.results.forEach(res => {
          if (res.status === 'success') {
            console.log(`   ✨ 成功: ${res.title}`);
            totalProcessed++;
          } else {
            console.warn(`   ⚠️ 失败: ${res.title} (${res.reason || res.error || '未知原因'})`);
          }
        });
      }

      console.log(`⏳ [Automation] 批处理完成，休眠 ${INTERVAL_MS/1000}s 后继续...`);
      await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));

    } catch (err) {
      console.error('💥 [Automation] 请求过程中发生崩溃:', err.message);
      console.log('🔄 [Automation] 5秒后尝试重启任务...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n🎉 [Automation] 清洗程序运行结束。共翻新了 ${totalProcessed} 条数据。`);
}

startAutoReformat();
