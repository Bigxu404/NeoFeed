import { useState } from 'react';
import { Menu, User, Clock, Bell, Settings, Sparkles, Brain, Layers, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { motion } from 'motion/react';
import { NeuralNetwork } from './components/NeuralNetwork';

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('登录:', username, password);
    setIsLoginOpen(false);
  };

  const navItems = [
    { icon: User, label: '个人信息', id: 'profile' },
    { icon: Clock, label: '历史记录', id: 'history' },
    { icon: Bell, label: '待处理信息', id: 'pending' },
    { icon: Settings, label: '设置', id: 'settings' },
  ];

  const features = [
    {
      icon: Zap,
      title: '无缝捕获',
      description: '自动保存，无需额外操作',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: Brain,
      title: '智能整合',
      description: '自动归类、摘要与结构化',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: Layers,
      title: '知识沉淀',
      description: '构建个人语义知识库',
      gradient: 'from-emerald-500/10 to-green-500/10',
      iconColor: 'text-emerald-600'
    },
    {
      icon: TrendingUp,
      title: '洞察周报',
      description: '定期获得可启发的信息周报',
      gradient: 'from-orange-500/10 to-amber-500/10',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col relative overflow-hidden">
      {/* 神经网络背景 */}
      <NeuralNetwork />
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="px-6 py-4 border-b border-gray-200">
                <SheetTitle>NeoFeed</SheetTitle>
                <SheetDescription className="sr-only">导航菜单</SheetDescription>
              </SheetHeader>
              <nav className="py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition-colors text-left"
                    onClick={() => console.log(`导航到 ${item.label}`)}
                  >
                    <item.icon className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-800">{item.label}</span>
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="tracking-tight">NeoFeed</span>
          </div>
        </div>

        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 border-0">
              登录
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>登录</DialogTitle>
              <DialogDescription>请输入您的账号和密码以登录系统</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">账号</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入账号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                登录
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-0">
        <div className="w-full max-w-4xl space-y-12">
          {/* Hero Section */}
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-700 rounded-full backdrop-blur-sm">
                <Brain className="h-4 w-4" />
                <span className="text-sm">信息的神经中枢</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              无需额外操作即可保存有价值的信息，自动完成归类、摘要与结构化。<br />
              NeoFeed 不只是笔记工具，而是一个会思考的个人信息助手。
            </p>
          </motion.div>

          {/* 输入框 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 border border-gray-200/50 p-8 hover:shadow-blue-500/20 transition-all duration-300">
              <div className="flex-1">
                <textarea
                  className="w-full min-h-[140px] resize-none outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                  placeholder="投喂你今天看过的信息给我"
                  aria-label="输入框"
                />
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div className="text-sm text-gray-500">
                    支持文本、链接、文档等多种格式
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 gap-2">
                    开始整合
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 特性卡片 */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:scale-105 transition-all duration-300 cursor-pointer group`}
                whileHover={{ y: -4 }}
              >
                <div className={`w-12 h-12 ${feature.iconColor} bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 底部提示 */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm text-gray-500">
              已为 <span className="text-blue-600">10,000+</span> 用户整合了超过 <span className="text-blue-600">5,000,000+</span> 条信息
            </p>
          </motion.div>
        </div>
      </main>

      {/* 底部装饰线 */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600" />
    </div>
  );
}
