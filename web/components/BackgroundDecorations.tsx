'use client'
import NeuralNetwork from './NeuralNetwork'

export function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#fafafa]">
      {/* 1. 噪点纹理层 - 质感的灵魂 */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-100"></div>

      {/* 2. 神经网络背景 - 降低透明度，让它隐入背景 */}
      <div className="opacity-30 mix-blend-multiply">
        <NeuralNetwork />
      </div>
      
      {/* 3. 有机光晕 (Organic Orbs) - 像呼吸一样微弱 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-b from-indigo-100/40 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-r from-blue-100/30 to-transparent rounded-full blur-[100px]" />
      </div>
    </div>
  )
}
