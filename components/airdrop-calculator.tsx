"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Sparkles, Twitter, X, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const translations = {
  en: {
    title: "SoDEX Airdrop",
    subtitle: "Calculate your estimated SOSO airdrop reward based on your points.",
    inputsTitle: "Calculator Inputs",
    totalPointsDistributed: "Total Points Distributed",
    yourPoints: "Your Points",
    totalTokensAirdrop: "Total Tokens For Airdrop",
    tokenPrice: "SOSO Token Price (USD)",
    farmCost: "Farm Cost (USD)",
    formulaTitle: "Formula Logic:",
    formulaShare: "Share",
    formulaTokens: "Tokens",
    formulaUsd: "USD",
    estimatedValue: "Estimated USD Value",
    usdValue: "USD Value",
    tokensPerPoint: "Tokens/Point",
    profitEstimated: "Estimated Profit",
    lossEstimated: "Estimated Loss",
    profit: "Profit",
    loss: "Loss",
    shareOnX: "Share on X",
    postOnX: "Post on X (downloads image automatically)",
    imageNote: "The image will be downloaded automatically. Attach it to your tweet on Twitter.",
    madeFor: "Made for the",
    community: "community",
    estimatedAirdropValue: "Estimated Airdrop Value",
    points: "Points",
    share: "Share",
    tokens: "Tokens",
    tweetText: (estimatedUsd: string, points: string, share: string, tokens: string, profitText: string) => 
      `My Estimated SoDEX Airdrop: $${estimatedUsd}

Points: ${points}
Share: ${share}%
Tokens: ${tokens}${profitText}

Calculate yours at v0-sodex-calculator.vercel.app`,
    profitTweetText: (value: string, roi: string) => `\nProfit: +$${value} (+${roi}% ROI)`,
    lossTweetText: (value: string, roi: string) => `\nLoss: -$${value} (${roi}% ROI)`,
  },
  pt: {
    title: "SoDEX Airdrop",
    subtitle: "Calcule sua recompensa estimada de airdrop SOSO com base nos seus pontos.",
    inputsTitle: "Dados de Entrada",
    totalPointsDistributed: "Total de Pontos Distribuidos",
    yourPoints: "Seus Pontos",
    totalTokensAirdrop: "Total de Tokens para Airdrop",
    tokenPrice: "Preco do Token SOSO (USD)",
    farmCost: "Custo do Farm (USD)",
    formulaTitle: "Logica das Formulas:",
    formulaShare: "Share",
    formulaTokens: "Tokens",
    formulaUsd: "USD",
    estimatedValue: "Valor Estimado em USD",
    usdValue: "Valor USD",
    tokensPerPoint: "Tokens/Ponto",
    profitEstimated: "Lucro Estimado",
    lossEstimated: "Prejuizo Estimado",
    profit: "Lucro",
    loss: "Prejuizo",
    shareOnX: "Compartilhar no X",
    postOnX: "Postar no X (baixa imagem automaticamente)",
    imageNote: "A imagem sera baixada automaticamente. Anexe-a ao seu tweet no Twitter.",
    madeFor: "Feito para a comunidade",
    community: "",
    estimatedAirdropValue: "Valor Estimado do Airdrop",
    points: "Pontos",
    share: "Share",
    tokens: "Tokens",
    tweetText: (estimatedUsd: string, points: string, share: string, tokens: string, profitText: string) => 
      `Meu Airdrop SoDEX Estimado: $${estimatedUsd}

Pontos: ${points}
Share: ${share}%
Tokens: ${tokens}${profitText}

Calcule o seu em v0-sodex-calculator.vercel.app`,
    profitTweetText: (value: string, roi: string) => `\nLucro: +$${value} (+${roi}% ROI)`,
    lossTweetText: (value: string, roi: string) => `\nPrejuizo: -$${value} (${roi}% ROI)`,
  },
}

type Language = "en" | "pt"

function formatDisplayValue(value: number, decimals: number, lang: Language): string {
  return value.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })
}

export function AirdropCalculator() {
  const [lang, setLang] = useState<Language>("en")
  const [totalPointsDistributed, setTotalPointsDistributed] = useState("100000000")
  const [yourPoints, setYourPoints] = useState("500000")
  const [totalTokensForAirdrop, setTotalTokensForAirdrop] = useState("100000000")
  const [sosoPrice, setSosoPrice] = useState("0.1")
  const [farmCost, setFarmCost] = useState("0")
  const [showShareModal, setShowShareModal] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const t = translations[lang]

  // Parse values for calculations - round to avoid floating point issues
  const totalPointsNum = parseFloat(totalPointsDistributed) || 0
  const yourPointsNum = parseFloat(yourPoints) || 0
  const totalTokensNum = parseFloat(totalTokensForAirdrop) || 0
  const sosoPriceNum = Math.round((parseFloat(sosoPrice) || 0) * 100) / 100
  const farmCostNum = Math.round((parseFloat(farmCost) || 0) * 100) / 100

  // Calculations based on document specs
  const userShare = totalPointsNum > 0 ? yourPointsNum / totalPointsNum : 0
  const estimatedTokens = userShare * totalTokensNum
  const estimatedUsd = Math.round(estimatedTokens * sosoPriceNum * 100) / 100
  const tokensPerPoint = totalPointsNum > 0 ? totalTokensNum / totalPointsNum : 0
  
  // Profit/Loss calculation
  const profitLoss = Math.round((estimatedUsd - farmCostNum) * 100) / 100
  const profitLossPercentage = farmCostNum > 0 ? ((estimatedUsd - farmCostNum) / farmCostNum) * 100 : 0
  const isProfit = profitLoss >= 0

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`
    return num.toFixed(decimals)
  }

  const generateAndDownloadImage = async () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = farmCostNum > 0 ? 580 : 440

    // Background
    ctx.fillStyle = "#0d0d0d"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw parachutes background
    const bgImage = document.createElement("img")
    bgImage.crossOrigin = "anonymous"
    bgImage.src = "/parachutes-bg.jpg"
    
    await new Promise<void>((resolve) => {
      bgImage.onload = () => resolve()
      bgImage.onerror = () => resolve()
    })

    // Draw parachutes at top with fade
    ctx.globalAlpha = 0.6
    ctx.drawImage(bgImage, 0, -50, 800, 300)
    ctx.globalAlpha = 1

    // Gradient overlay for fade effect
    const fadeGradient = ctx.createLinearGradient(0, 0, 0, 250)
    fadeGradient.addColorStop(0, "rgba(13, 13, 13, 0)")
    fadeGradient.addColorStop(0.7, "rgba(13, 13, 13, 0.8)")
    fadeGradient.addColorStop(1, "rgba(13, 13, 13, 1)")
    ctx.fillStyle = fadeGradient
    ctx.fillRect(0, 0, canvas.width, 250)

    // Load and draw logo
    const logo = document.createElement("img")
    logo.crossOrigin = "anonymous"
    logo.src = "/sodex-logo.png"
    
    await new Promise<void>((resolve) => {
      logo.onload = () => resolve()
      logo.onerror = () => resolve()
    })

    ctx.drawImage(logo, 40, 30, 50, 50)

    // SoDEX Airdrop text
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "#ffffff"
    ctx.fillText("SoDEX Airdrop", 100, 65)

    // Subtitle
    ctx.font = "12px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "#a3a3a3"
    const subtitleText = lang === "pt" ? "VALOR ESTIMADO DO AIRDROP" : "ESTIMATED AIRDROP VALUE"
    ctx.fillText(subtitleText, 40, 120)

    // Main value
    ctx.font = "bold 56px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "#f97316"
    ctx.fillText(`$${formatDisplayValue(estimatedUsd, 2, lang)}`, 40, 180)

    // Stats boxes
    const boxY = 210
    const boxHeight = 70
    const boxWidth = 230
    const boxGap = 20

    const stats = [
      { label: lang === "pt" ? "PONTOS" : "POINTS", value: yourPointsNum.toLocaleString(lang === "pt" ? "pt-BR" : "en-US"), color: "#ffffff" },
      { label: "SHARE", value: `${formatDisplayValue(userShare * 100, 4, lang)}%`, color: "#f97316" },
      { label: "TOKENS", value: formatNumber(estimatedTokens), color: "#ffffff" },
    ]

    stats.forEach((stat, i) => {
      const boxX = 40 + i * (boxWidth + boxGap)
      
      ctx.fillStyle = "#262626"
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12)
      ctx.fill()

      ctx.font = "10px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = "#a3a3a3"
      ctx.fillText(stat.label, boxX + 15, boxY + 25)

      ctx.font = "bold 22px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = stat.color
      ctx.fillText(stat.value, boxX + 15, boxY + 52)
    })

    // Profit/Loss section if applicable
    if (farmCostNum > 0) {
      const profitY = 310
      const profitHeight = 100
      
      ctx.fillStyle = isProfit ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"
      ctx.beginPath()
      ctx.roundRect(40, profitY, 720, profitHeight, 16)
      ctx.fill()

      ctx.strokeStyle = isProfit ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = "12px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = "#a3a3a3"
      const profitLabel = isProfit 
        ? (lang === "pt" ? "LUCRO ESTIMADO" : "ESTIMATED PROFIT")
        : (lang === "pt" ? "PREJUIZO ESTIMADO" : "ESTIMATED LOSS")
      ctx.fillText(profitLabel, 60, profitY + 35)

      ctx.font = "bold 40px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = isProfit ? "#4ade80" : "#f87171"
      ctx.fillText(`${isProfit ? "+" : "-"}$${formatDisplayValue(Math.abs(profitLoss), 2, lang)}`, 60, profitY + 80)

      ctx.font = "bold 28px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${isProfit ? "+" : ""}${formatDisplayValue(profitLossPercentage, 2, lang)}%`, 740, profitY + 60)
      ctx.font = "12px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = "#a3a3a3"
      ctx.fillText("ROI", 740, profitY + 80)
      ctx.textAlign = "left"
    }

    // Website URL
    ctx.font = "14px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "#666666"
    ctx.textAlign = "center"
    ctx.fillText("v0-sodex-calculator.vercel.app", canvas.width / 2, canvas.height - 20)

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "sodex-airdrop.png"
        a.click()
        URL.revokeObjectURL(url)
      }
    }, "image/png")
  }

  const handleShareX = () => {
    const profitText = farmCostNum > 0
      ? (isProfit 
          ? t.profitTweetText(formatDisplayValue(profitLoss, 2, lang), formatDisplayValue(profitLossPercentage, 2, lang))
          : t.lossTweetText(formatDisplayValue(Math.abs(profitLoss), 2, lang), formatDisplayValue(profitLossPercentage, 2, lang)))
      : ""

    const text = t.tweetText(
      formatDisplayValue(estimatedUsd, 2, lang),
      yourPointsNum.toLocaleString(lang === "pt" ? "pt-BR" : "en-US"),
      formatDisplayValue(userShare * 100, 4, lang),
      formatNumber(estimatedTokens),
      profitText
    )

    generateAndDownloadImage()
    
    setTimeout(() => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
      setShowShareModal(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Parachutes Background Image */}
      <div className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden">
        <Image
          src="/parachutes-bg.jpg"
          alt="Parachutes"
          fill
          className="object-cover object-top opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          
          <div className="relative z-10 w-full max-w-lg">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div ref={shareCardRef} className="bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] border border-border rounded-3xl relative overflow-hidden">
              {/* Parachutes in modal */}
              <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
                <Image
                  src="/parachutes-bg.jpg"
                  alt="Parachutes"
                  fill
                  className="object-cover object-top opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d0d0d]" />
              </div>
              
              <div className="relative z-10 p-6 pt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/sodex-logo.png"
                    alt="SoDEX"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                  <span className="font-bold text-2xl">SoDEX Airdrop</span>
                </div>

                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t.estimatedAirdropValue}
                </p>
                <p className="text-5xl font-bold text-primary mb-6">
                  ${formatDisplayValue(estimatedUsd, 2, lang)}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.points}</p>
                    <p className="text-lg font-bold">{yourPointsNum.toLocaleString(lang === "pt" ? "pt-BR" : "en-US")}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.share}</p>
                    <p className="text-lg font-bold text-primary">{formatDisplayValue(userShare * 100, 4, lang)}%</p>
                  </div>
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.tokens}</p>
                    <p className="text-lg font-bold">{formatNumber(estimatedTokens)}</p>
                  </div>
                </div>

                {farmCostNum > 0 && (
                  <div className={cn(
                    "rounded-xl p-4 mb-6 border",
                    isProfit 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {isProfit ? t.profitEstimated : t.lossEstimated}
                        </p>
                        <p className={cn(
                          "text-3xl font-bold",
                          isProfit ? "text-green-400" : "text-red-400"
                        )}>
                          {isProfit ? "+" : "-"}${formatDisplayValue(Math.abs(profitLoss), 2, lang)}
                        </p>
                      </div>
                      <div className={cn(
                        "text-right",
                        isProfit ? "text-green-400" : "text-red-400"
                      )}>
                        <p className="text-2xl font-bold">
                          {isProfit ? "+" : ""}{formatDisplayValue(profitLossPercentage, 2, lang)}%
                        </p>
                        <p className="text-xs uppercase tracking-wider">ROI</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  v0-sodex-calculator.vercel.app
                </p>
              </div>
            </div>

            <button
              onClick={handleShareX}
              className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-300 font-semibold text-lg"
            >
              <Twitter className="w-6 h-6" />
              {t.postOnX}
            </button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              {t.imageNote}
            </p>
          </div>
        </div>
      )}

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "en" ? "pt" : "en")}
            className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full hover:border-primary/50 transition-all duration-300"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{lang === "en" ? "EN" : "PT"}</span>
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/sodex-logo.png"
              alt="SoDEX"
              width={56}
              height={56}
              className="w-14 h-14"
            />
            <span className="text-3xl font-bold tracking-tight">SoDEX</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
            {t.subtitle}
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Calculator Inputs */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-6 space-y-6 hover:border-primary/30 transition-colors duration-300">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t.inputsTitle}
            </h2>

            {/* Total Points Distributed */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                {t.totalPointsDistributed}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={totalPointsDistributed}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setTotalPointsDistributed(value)
                }}
                placeholder="0"
                className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-2xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/50"
              />
              <input
                type="range"
                min={10000000}
                max={500000000}
                step={1000000}
                value={totalPointsNum || 10000000}
                onChange={(e) => setTotalPointsDistributed(e.target.value)}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
              />
            </div>

            {/* Your Points */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                {t.yourPoints}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={yourPoints}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setYourPoints(value)
                }}
                placeholder="0"
                className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-2xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/50"
              />
              <input
                type="range"
                min={0}
                max={totalPointsNum * 0.5 || 50000000}
                step={1000}
                value={yourPointsNum || 0}
                onChange={(e) => setYourPoints(e.target.value)}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
              />
            </div>

            {/* Total Tokens For Airdrop */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                {t.totalTokensAirdrop}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={totalTokensForAirdrop}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setTotalTokensForAirdrop(value)
                }}
                placeholder="0"
                className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-2xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/50"
              />
              <input
                type="range"
                min={1000000}
                max={1000000000}
                step={1000000}
                value={totalTokensNum || 1000000}
                onChange={(e) => setTotalTokensForAirdrop(e.target.value)}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
              />
            </div>

            {/* SOSO Token Price */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                {t.tokenPrice}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sosoPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    const parts = value.split(".")
                    if (parts.length > 2) return
                    setSosoPrice(value)
                  }}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-secondary/50 border border-border rounded-2xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/50"
                />
              </div>
              <input
                type="range"
                min={0.01}
                max={10}
                step={0.01}
                value={sosoPriceNum || 0.01}
                onChange={(e) => setSosoPrice(e.target.value)}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
              />
            </div>

            {/* Farm Cost */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                {t.farmCost}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={farmCost}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    const parts = value.split(".")
                    if (parts.length > 2) return
                    setFarmCost(value)
                  }}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-secondary/50 border border-border rounded-2xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-6 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/sodex-logo.png"
                  alt="SoDEX"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="font-bold text-xl">SoDEX Airdrop</span>
              </div>

              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  {t.estimatedValue}
                </p>
                <p className="text-5xl md:text-6xl font-bold text-primary mb-8">
                  ${formatDisplayValue(estimatedUsd, 2, lang)}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.share} %</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatDisplayValue(userShare * 100, 4, lang)}%
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.tokens}</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(estimatedTokens)}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.usdValue}</p>
                    <p className="text-2xl font-bold text-primary">
                      ${formatDisplayValue(estimatedUsd, 2, lang)}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.tokensPerPoint}</p>
                    <p className="text-2xl font-bold">
                      {formatDisplayValue(tokensPerPoint, 4, lang)}
                    </p>
                  </div>
                </div>

                {/* Profit/Loss Section */}
                {farmCostNum > 0 && (
                  <div className={cn(
                    "mt-6 p-5 rounded-2xl border-2 transition-all duration-300",
                    isProfit 
                      ? "bg-green-500/10 border-green-500/50" 
                      : "bg-red-500/10 border-red-500/50"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">
                        {isProfit ? t.profitEstimated : t.lossEstimated}
                      </p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        isProfit ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {isProfit ? t.profit : t.loss}
                      </span>
                    </div>
                    <p className={cn(
                      "text-4xl font-bold",
                      isProfit ? "text-green-400" : "text-red-400"
                    )}>
                      {isProfit ? "+" : "-"}${formatDisplayValue(Math.abs(profitLoss), 2, lang)}
                    </p>
                    <p className={cn(
                      "text-lg font-semibold mt-1",
                      isProfit ? "text-green-400/70" : "text-red-400/70"
                    )}>
                      {isProfit ? "+" : ""}{formatDisplayValue(profitLossPercentage, 2, lang)}% ROI
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-300"
            >
              <Twitter className="w-5 h-5" />
              <span className="font-semibold">{t.shareOnX}</span>
            </button>

            {/* Formula Info */}
            <div className="bg-secondary/30 rounded-2xl p-5 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground mb-3">{t.formulaTitle}</p>
              <p><span className="text-primary">{t.formulaShare}</span> = {t.yourPoints} / {t.totalPointsDistributed}</p>
              <p><span className="text-primary">{t.formulaTokens}</span> = {t.share} x {t.totalTokensAirdrop}</p>
              <p><span className="text-primary">{t.formulaUsd}</span> = {t.tokens} x {t.tokenPrice}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-muted-foreground">
            {t.madeFor} <span className="text-primary font-semibold">SoDEX</span> {t.community}
          </p>
        </footer>
      </main>
    </div>
  )
}
