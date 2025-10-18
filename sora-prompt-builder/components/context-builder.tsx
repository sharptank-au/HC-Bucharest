"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePromptStore } from "@/lib/prompt-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eraser } from "lucide-react"

// Context presets
const contextPresets = {
  grade: {
    none: "",
    modern_digital:
      "Clean digital acquisition, minimal grain\nHighlights: controlled with HDR retention\nMids: balanced neutrals with accurate skin tones\nBlacks: neutral deep blacks\nPalette: accurate color reproduction, slight teal-orange separation",
    documentary:
      "Natural color grading with minimal manipulation\nHighlights: true-to-life luminance\nMids: neutral balanced realism\nBlacks: soft natural depth\nPalette: authentic environmental colors",
    imax_scale:
      "Ultra-high resolution digital capture\nHighlights: clean whites with controlled roll-off\nMids: neutral balanced with rich color saturation\nBlacks: deep pure blacks with detail retention\nPalette: vivid primary colors, crisp whites, deep shadows",
    technicolor:
      "Three-strip saturated color process\nHighlights: vibrant saturated color retention\nMids: rich primary color separation\nBlacks: deep saturated blacks\nPalette: bold reds, emerald greens, royal blues, golden yellows",
    vintage_8mm:
      "Heavy grain structure throughout\nHighlights: blown highlights with halation\nMids: desaturated with magenta-yellow cast\nBlacks: milky lifted blacks with vignette\nPalette: faded pastels, muted primaries",
    cyberpunk_neon:
      "High contrast digital with color push\nHighlights: blown neon pinks and electric blues\nMids: crushed shadows with neon spill\nBlacks: deep blacks with cyan-magenta separation\nPalette: hot pink, cyan, purple, deep blacks",
  },
  lighting: {
    none: "",
    high_key_studio:
      "Bright even studio lighting setup\nKey: large softbox frontal (5600K)\nFill: matched intensity from sides\nBack: hair light for separation\nAtmos: bright, clean, commercial look\nContrast: minimal 1.5:1 ratio",
    golden_hour:
      "Natural sunlight from low angle (06:30 or 18:00)\nKey: warm amber direct sun from side\nFill: soft blue sky bounce from opposite\nAtmos: gentle haze with visible light beams\nColor temp: 3200K key, 5600K fill",
    neon_artificial:
      "Practical neon signs as key sources\nKey: vibrant colored neon (pink, blue, green)\nFill: spill from multiple colored sources\nPractical: glowing signage, LED displays\nAtmos: urban nighttime, layered colored light",
    overcast_diffused:
      "Soft natural light through heavy cloud cover\nKey: omnidirectional diffused daylight (6500K)\nFill: even ambient, minimal shadows\nAtmos: flat even exposure, gentle soft light\nContrast: low 2:1 ratio",
    moody_twilight:
      "Blue hour ambient (20 minutes post-sunset)\nKey: sodium street lights (2000K amber)\nFill: deep blue skylight (8000K)\nPractical: warm window light in background\nAtmos: light mist, soft diffusion throughout",
    cool_moonlight:
      "Simulated night exterior moonlight\nKey: cool blue overhead (8000K-9000K)\nFill: very minimal, deep blue shadows\nPractical: dim warm windows in distance\nAtmos: night fog, cool mist\nEffect: mysterious nocturnal atmosphere",
  },
  location: {
    none: "",
    shallow_dof:
      "Camera: portrait lens wide open (85mm f/1.4)\nFocus: critical focus on subject eyes\nDepth: bokeh background blur\nSeparation: subject isolated from environment\nEffect: cinematic subject isolation",
    wide_establishing:
      "Camera: wide angle lens (24mm or wider)\nDistance: 20+ feet from subject\nHeight: eye level or elevated\nDepth: deep focus showing foreground to infinity\nComposition: subject in environment context\nMovement: static or slow dolly",
    handheld_documentary:
      "Camera: standard zoom lens (24-70mm)\nDistance: varies, follows action\nHeight: operator height, natural movement\nMovement: organic handheld shake and reframing\nComposition: reactive to subject\nEffect: gritty realism, immediacy, authenticity",
    medium_eye_level:
      "Camera: standard lens (35-50mm)\nDistance: 6-10 feet from subject\nHeight: 5-6 feet (natural eye level)\nDepth: moderate focus (f/4-f/5.6)\nComposition: waist-up or full body framing\nMovement: tracking or static",
    first_person_pov:
      "Camera: subject perspective (24-35mm)\nDistance: what subject sees\nHeight: subject eye level, natural head movement\nMovement: handheld with breathing and natural sway\nComposition: subjective camera, audience is character\nEffect: immersive, intimate point of view",
    over_shoulder:
      "Camera: medium lens (50mm)\nDistance: 4-6 feet behind foreground subject\nHeight: subject shoulder height\nComposition: foreground subject shoulder/head, background subject in focus\nDepth: moderate focus (f/2.8-f/4)\nEffect: conversation framing, relationship perspective",
  },
  wardrobe: {
    none: "",
    minimalist_modern:
      "Contemporary neutral tones\nWardrobe: clean lines, simple cuts, muted colors\nFabrics: quality cotton, wool, minimal patterns\nAccessories: understated modern pieces\nColor palette: blacks, grays, whites, navy, olive",
    business_corporate:
      "Professional office attire\nWardrobe: tailored suits, dress shirts, business casual\nFabrics: wool, cotton, synthetic blends\nAccessories: ties, watches, briefcases, laptops\nColor palette: navy, charcoal, white, burgundy\nDetails: crisp professional presentation",
    streetwear_urban:
      "Contemporary street fashion\nWardrobe: hoodies, sneakers, branded athletic wear\nFabrics: jersey, denim, technical fabrics\nAccessories: caps, chains, backpacks, headphones\nStyling: layered, logo-prominent, youth culture\nDetails: brand-conscious, trend-aware aesthetic",
    practical_props:
      "Functional set dressing and handheld items\nProps: coffee cups, phones, bags, newspapers\nSet dressing: books, plants, clutter\nExtras: natural interaction with environment\nDetails: worn realistic items with history",
    vibrant_colorful:
      "Bold saturated color choices\nWardrobe: primary and secondary colors, patterns\nFabrics: varied textures creating visual interest\nAccessories: statement pieces, jewelry\nContrast: intentional color blocking and clashes",
    futuristic_elements:
      "Sci-fi design language\nWardrobe: sleek synthetic fabrics, unusual cuts\nProps: glowing panels, holographic displays, tech devices\nMaterials: chrome, acrylic, LED integration\nDetails: clean lines, minimal texture, high-tech feel",
  },
  sound: {
    none: "",
    dramatic_music:
      "Non-diegetic score driving emotion\nMusic: orchestral or electronic score at -18 LUFS\nAmbient: reduced to support music\nDynamics: swells and crescendos for emphasis\nEffect: heightened emotional narrative",
    dialogue_driven:
      "Character conversation as primary audio\nDialogue: clear centered at -12 LUFS\nAmbient: reduced to -30 LUFS for clarity\nFootsteps: subtle at -20 LUFS\nEffect: intimate conversational focus",
    ambient_environmental:
      "Diegetic environmental sound only\nBackground: wind, traffic, nature sounds at -25 LUFS\nMid: footsteps, rustling, object interaction\nForeground: clear subject sounds\nNo music: pure environmental authenticity",
    minimal_sound:
      "Sparse deliberate audio elements\nAmbient: barely perceptible room tone\nFoley: selective key sounds only\nSilence: intentional quiet moments\nEffect: contemplative, focused attention",
    action_intense:
      "High-energy action sound design\nEffects: impacts, explosions, whooshes at -15 LUFS\nMusic: driving rhythmic score at -18 LUFS\nDialogue: compressed for clarity at -12 LUFS\nDynamics: loud aggressive mixing\nEffect: adrenaline-pumping intensity",
    retro_analog:
      "Vintage audio aesthetic\nQuality: tape hiss, vinyl crackle, warm distortion\nMusic: period-appropriate mono or stereo\nFrequency: rolled-off highs, limited bass response\nEffect: nostalgic analog warmth\nFormat: lo-fi vintage processing",
  },
}

interface ContextBuilderProps {
  onNext: () => void
  onBack: () => void
}

export function ContextBuilder({ onNext, onBack }: ContextBuilderProps) {
  const {
    context,
    setContext,
    highLevelDescription,
    setHighLevelDescription,
    mode,
    setMode,
    aspectRatio,
    setAspectRatio,
  } = usePromptStore()

  const [selectedGrade, setSelectedGrade] = useState("none")
  const [selectedLighting, setSelectedLighting] = useState("none")
  const [selectedLocation, setSelectedLocation] = useState("none")
  const [selectedWardrobe, setSelectedWardrobe] = useState("none")
  const [selectedSound, setSelectedSound] = useState("none")

  const [gradeText, setGradeText] = useState("")
  const [lightingText, setLightingText] = useState("")
  const [locationText, setLocationText] = useState("")
  const [wardrobeText, setWardrobeText] = useState("")
  const [soundText, setSoundText] = useState("")

  useEffect(() => {
    if (selectedGrade !== "none") {
      setGradeText(contextPresets.grade[selectedGrade as keyof typeof contextPresets.grade])
    }
  }, [selectedGrade])

  useEffect(() => {
    if (selectedLighting !== "none") {
      setLightingText(contextPresets.lighting[selectedLighting as keyof typeof contextPresets.lighting])
    }
  }, [selectedLighting])

  useEffect(() => {
    if (selectedLocation !== "none") {
      setLocationText(contextPresets.location[selectedLocation as keyof typeof contextPresets.location])
    }
  }, [selectedLocation])

  useEffect(() => {
    if (selectedWardrobe !== "none") {
      setWardrobeText(contextPresets.wardrobe[selectedWardrobe as keyof typeof contextPresets.wardrobe])
    }
  }, [selectedWardrobe])

  useEffect(() => {
    if (selectedSound !== "none") {
      setSoundText(contextPresets.sound[selectedSound as keyof typeof contextPresets.sound])
    }
  }, [selectedSound])

  const handleContinue = () => {
    setContext("grade", gradeText)
    setContext("lighting", lightingText)
    setContext("location", locationText)
    setContext("wardrobe", wardrobeText)
    setContext("sound", soundText)
    onNext()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Customize Context</h2>
        <p className="text-muted-foreground">Define the visual and audio parameters for your video</p>
      </div>

      {/* Mode Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Prompt Mode</Label>
            <p className="text-sm text-muted-foreground">Choose how you want to structure your prompt</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card
              className={`cursor-pointer border-2 p-4 transition-all hover:border-accent ${
                mode.highLevel && !mode.detailedShots ? "border-accent bg-accent/5" : "border-border"
              }`}
              onClick={() => setMode(true, false)}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">High-Level Only</h4>
                <p className="text-xs text-muted-foreground">Single description, maximum creative freedom</p>
              </div>
            </Card>
            <Card
              className={`cursor-pointer border-2 p-4 transition-all hover:border-accent ${
                !mode.highLevel && mode.detailedShots ? "border-accent bg-accent/5" : "border-border"
              }`}
              onClick={() => setMode(false, true)}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Detailed Shots Only</h4>
                <p className="text-xs text-muted-foreground">Shot-by-shot breakdown, precise control</p>
              </div>
            </Card>
            <Card
              className={`cursor-pointer border-2 p-4 transition-all hover:border-accent ${
                mode.highLevel && mode.detailedShots ? "border-accent bg-accent/5" : "border-border"
              }`}
              onClick={() => setMode(true, true)}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Combined</h4>
                <p className="text-xs text-muted-foreground">Overview + shot details, best of both</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* High-Level Description */}
      {mode.highLevel && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-4">
            <div>
              <Label htmlFor="high-level" className="text-base font-semibold">
                High-Level Description
              </Label>
              <p className="text-sm text-muted-foreground">Describe the overall vision for your video</p>
            </div>
            <Textarea
              id="high-level"
              placeholder="A sleek, cinematic ad introducing a premium product with macro beauty shots, minimal text overlays, and refined motion typography..."
              value={highLevelDescription}
              onChange={(e) => setHighLevelDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </Card>
      )}

      {/* Aspect Ratio */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Aspect Ratio</Label>
            <p className="text-sm text-muted-foreground">Choose the video dimensions</p>
          </div>
          <div className="flex gap-3">
            {(["16:9", "9:16", "1:1"] as const).map((ratio) => (
              <Button
                key={ratio}
                variant={aspectRatio === ratio ? "default" : "outline"}
                onClick={() => setAspectRatio(ratio)}
                className="flex-1"
              >
                {ratio}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Context Parameters */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade / Palette */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="grade" className="text-base font-semibold">
                  Grade / Color Palette
                </Label>
                <p className="text-sm text-muted-foreground">Color grading and visual tone</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setGradeText("")} className="h-8 w-8 p-0">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.keys(contextPresets.grade)
                  .filter((k) => k !== "none")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Enter custom grade/color palette description or select from presets above..."
              value={gradeText}
              onChange={(e) => setGradeText(e.target.value)}
              className="min-h-[100px] resize-none font-mono text-xs"
            />
          </div>
        </Card>

        {/* Lighting */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="lighting" className="text-base font-semibold">
                  Lighting & Atmosphere
                </Label>
                <p className="text-sm text-muted-foreground">Light setup and mood</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLightingText("")} className="h-8 w-8 p-0">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedLighting} onValueChange={setSelectedLighting}>
              <SelectTrigger id="lighting">
                <SelectValue placeholder="Select lighting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.keys(contextPresets.lighting)
                  .filter((k) => k !== "none")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Enter custom lighting description or select from presets above..."
              value={lightingText}
              onChange={(e) => setLightingText(e.target.value)}
              className="min-h-[100px] resize-none font-mono text-xs"
            />
          </div>
        </Card>

        {/* Location / Framing */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="location" className="text-base font-semibold">
                  Location & Framing
                </Label>
                <p className="text-sm text-muted-foreground">Camera position and composition</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocationText("")} className="h-8 w-8 p-0">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.keys(contextPresets.location)
                  .filter((k) => k !== "none")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Enter custom location/framing description or select from presets above..."
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="min-h-[100px] resize-none font-mono text-xs"
            />
          </div>
        </Card>

        {/* Wardrobe / Props */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="wardrobe" className="text-base font-semibold">
                  Wardrobe / Props / Extras
                </Label>
                <p className="text-sm text-muted-foreground">Styling and set dressing</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setWardrobeText("")} className="h-8 w-8 p-0">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedWardrobe} onValueChange={setSelectedWardrobe}>
              <SelectTrigger id="wardrobe">
                <SelectValue placeholder="Select wardrobe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.keys(contextPresets.wardrobe)
                  .filter((k) => k !== "none")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Enter custom wardrobe/props description or select from presets above..."
              value={wardrobeText}
              onChange={(e) => setWardrobeText(e.target.value)}
              className="min-h-[100px] resize-none font-mono text-xs"
            />
          </div>
        </Card>
      </div>

      {/* Sound */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="sound" className="text-base font-semibold">
                Sound Design
              </Label>
              <p className="text-sm text-muted-foreground">Audio style and mixing approach</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSoundText("")} className="h-8 w-8 p-0">
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          <Select value={selectedSound} onValueChange={setSelectedSound}>
            <SelectTrigger id="sound">
              <SelectValue placeholder="Select sound" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {Object.keys(contextPresets.sound)
                .filter((k) => k !== "none")
                .map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Enter custom sound design description or select from presets above..."
            value={soundText}
            onChange={(e) => setSoundText(e.target.value)}
            className="min-h-[100px] resize-none font-mono text-xs"
          />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button size="lg" onClick={handleContinue} className="min-w-[200px]">
          Continue to Shots
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
