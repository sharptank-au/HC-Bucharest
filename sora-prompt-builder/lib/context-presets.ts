// Context preset definitions with detailed examples
const contextPresets = {
  grade: {
    none: "",
    "1970s_film":
      "Highlights: warm amber lift with slight grain\nMids: balanced earth tones with subtle magenta shift\nBlacks: crushed with film grain texture\nPalette: burnt orange, avocado green, harvest gold",
    bleach_bypass:
      "Silver retention process, desaturated color\nHighlights: blown whites with harsh edges\nMids: desaturated with enhanced contrast\nBlacks: deep blacks with metallic sheen\nPalette: muted colors with silver-gray overlay, military aesthetic",
    cyberpunk_neon:
      "High contrast digital with color push\nHighlights: blown neon pinks and electric blues\nMids: crushed shadows with neon spill\nBlacks: deep blacks with cyan-magenta separation\nPalette: hot pink, cyan, purple, deep blacks",
    documentary:
      "Natural color grading with minimal manipulation\nHighlights: true-to-life luminance\nMids: neutral balanced realism\nBlacks: soft natural depth\nPalette: authentic environmental colors",
    horror_desaturated:
      "Low saturation with green-gray cast\nHighlights: sickly green lift in whites\nMids: drained color with muddy browns\nBlacks: crushed near-black with green tint\nPalette: olive greens, dead browns, cold grays",
    imax_scale:
      "Ultra-high resolution digital capture\nHighlights: clean whites with controlled roll-off\nMids: neutral balanced with rich color saturation\nBlacks: deep pure blacks with detail retention\nPalette: vivid primary colors, crisp whites, deep shadows",
    modern_digital:
      "Clean digital acquisition, minimal grain\nHighlights: controlled with HDR retention\nMids: balanced neutrals with accurate skin tones\nBlacks: neutral deep blacks\nPalette: accurate color reproduction, slight teal-orange separation",
    noir: "Black and white high contrast\nHighlights: bright whites with sharp edges\nMids: dramatic gradation and deep shadows\nBlacks: pure black with crushed detail\nContrast: hard light ratios 8:1 or higher",
    sepia_vintage:
      "Monochrome sepia tone processing\nHighlights: warm cream highlights\nMids: rich brown midtones throughout\nBlacks: warm dark brown, never pure black\nPalette: graduated sepia scale from cream to chocolate",
    technicolor:
      "Three-strip saturated color process\nHighlights: vibrant saturated color retention\nMids: rich primary color separation\nBlacks: deep saturated blacks\nPalette: bold reds, emerald greens, royal blues, golden yellows",
    vintage_8mm:
      "Heavy grain structure throughout\nHighlights: blown highlights with halation\nMids: desaturated with magenta-yellow cast\nBlacks: milky lifted blacks with vignette\nPalette: faded pastels, muted primaries",
  },
  lighting: {
    none: "",
    backlit_silhouette:
      "Strong backlight creating silhouette\nKey: bright light source behind subject\nFill: minimal or none, deep shadows on face\nRim: strong edge light defining shape\nAtmos: dramatic contrast, mystery\nEffect: subject as dark shape against bright background",
    chiaroscuro:
      "Renaissance painting-style dramatic lighting\nKey: single hard source from 45 degrees (2800K)\nFill: minimal bounce, deep shadows\nContrast: 16:1 ratio, theatrical drama\nAtmos: Rembrandt lighting, triangle on cheek\nEffect: sculptural, painterly quality",
    cool_moonlight:
      "Simulated night exterior moonlight\nKey: cool blue overhead (8000K-9000K)\nFill: very minimal, deep blue shadows\nPractical: dim warm windows in distance\nAtmos: night fog, cool mist\nEffect: mysterious nocturnal atmosphere",
    fire_flicker:
      "Practical fire as primary light source\nKey: warm orange flickering light (1900K)\nFill: bounce from surrounding surfaces\nDynamics: random intensity variations\nAtmos: warm dancing shadows\nEffect: primitive, primal atmosphere",
    golden_hour:
      "Natural sunlight from low angle (06:30 or 18:00)\nKey: warm amber direct sun from side\nFill: soft blue sky bounce from opposite\nAtmos: gentle haze with visible light beams\nColor temp: 3200K key, 5600K fill",
    harsh_fluorescent:
      "Overhead practical fluorescent tubes\nKey: cool green-tinted overhead (4100K)\nFill: minimal, hard shadows on floor\nNegative fill: dark walls absorbing light\nAtmos: sterile institutional feel",
    high_key_studio:
      "Bright even studio lighting setup\nKey: large softbox frontal (5600K)\nFill: matched intensity from sides\nBack: hair light for separation\nAtmos: bright, clean, commercial look\nContrast: minimal 1.5:1 ratio",
    moody_twilight:
      "Blue hour ambient (20 minutes post-sunset)\nKey: sodium street lights (2000K amber)\nFill: deep blue skylight (8000K)\nPractical: warm window light in background\nAtmos: light mist, soft diffusion throughout",
    neon_artificial:
      "Practical neon signs as key sources\nKey: vibrant colored neon (pink, blue, green)\nFill: spill from multiple colored sources\nPractical: glowing signage, LED displays\nAtmos: urban nighttime, layered colored light",
    overcast_diffused:
      "Soft natural light through heavy cloud cover\nKey: omnidirectional diffused daylight (6500K)\nFill: even ambient, minimal shadows\nAtmos: flat even exposure, gentle soft light\nContrast: low 2:1 ratio",
    underwater_caustics:
      "Underwater or water-reflected light patterns\nKey: dappled caustic patterns from above\nFill: blue-green ambient water color (7000K cyan-shifted)\nDynamics: moving water patterns across surfaces\nAtmos: aquatic diffusion, particles in water\nEffect: dreamy, submerged atmosphere",
    warm_candlelight:
      "Practical candles as motivated key (1800K)\nKey: flickering warm glow from candles\nFill: soft bounce from warm-toned walls\nNegative fill: deep shadows in corners\nAtmos: intimate, contained light pool",
  },
  location: {
    none: "",
    aerial_drone:
      "Camera: wide lens on stabilized drone (16-24mm)\nDistance: 50-200 feet from subject\nHeight: 20-500 feet elevated\nMovement: smooth sweeping or rising motion\nDepth: deep focus showing landscape scale\nEffect: epic establishing scale, cinematic scope",
    canted_dutch:
      "Camera: tilted 15-45 degrees off horizontal axis\nDistance: varies by subject\nHeight: typically eye level\nComposition: diagonal lines, unbalanced framing\nEffect: disorientation, tension, unease\nMovement: can track while maintaining tilt",
    deep_focus:
      "Camera: wide lens stopped down (24mm f/11)\nFocus: everything sharp from 3 feet to infinity\nDepth: extensive depth of field\nComposition: layered foreground, mid, background\nEffect: environmental storytelling",
    first_person_pov:
      "Camera: subject perspective (24-35mm)\nDistance: what subject sees\nHeight: subject eye level, natural head movement\nMovement: handheld with breathing and natural sway\nComposition: subjective camera, audience is character\nEffect: immersive, intimate point of view",
    handheld_documentary:
      "Camera: standard zoom lens (24-70mm)\nDistance: varies, follows action\nHeight: operator height, natural movement\nMovement: organic handheld shake and reframing\nComposition: reactive to subject\nEffect: gritty realism, immediacy, authenticity",
    high_angle_down:
      "Camera: tilted downward 45-90 degrees\nDistance: 8-20 feet from subject\nHeight: 8+ feet elevated\nDepth: moderate to deep focus\nComposition: subject diminished, environment visible\nEffect: vulnerable, observational perspective",
    intimate_closeup:
      "Camera: portrait lens (85mm or longer)\nDistance: 2-4 feet from subject\nHeight: eye level to subject\nDepth: shallow focus (f/1.4-f/2.8)\nComposition: face fills frame, environmental detail minimal\nMovement: static or subtle handheld breathing",
    low_angle_up:
      "Camera: tilted upward 30-60 degrees\nDistance: 4-8 feet from subject\nHeight: 2-3 feet off ground\nDepth: wide or moderate focus\nComposition: subject towers above camera\nEffect: powerful, imposing perspective",
    medium_eye_level:
      "Camera: standard lens (35-50mm)\nDistance: 6-10 feet from subject\nHeight: 5-6 feet (natural eye level)\nDepth: moderate focus (f/4-f/5.6)\nComposition: waist-up or full body framing\nMovement: tracking or static",
    over_shoulder:
      "Camera: medium lens (50mm)\nDistance: 4-6 feet behind foreground subject\nHeight: subject shoulder height\nComposition: foreground subject shoulder/head, background subject in focus\nDepth: moderate focus (f/2.8-f/4)\nEffect: conversation framing, relationship perspective",
    shallow_dof:
      "Camera: portrait lens wide open (85mm f/1.4)\nFocus: critical focus on subject eyes\nDepth: bokeh background blur\nSeparation: subject isolated from environment\nEffect: cinematic subject isolation",
    wide_establishing:
      "Camera: wide angle lens (24mm or wider)\nDistance: 20+ feet from subject\nHeight: eye level or elevated\nDepth: deep focus showing foreground to infinity\nComposition: subject in environment context\nMovement: static or slow dolly",
  },
  wardrobe: {
    none: "",
    business_corporate:
      "Professional office attire\nWardrobe: tailored suits, dress shirts, business casual\nFabrics: wool, cotton, synthetic blends\nAccessories: ties, watches, briefcases, laptops\nColor palette: navy, charcoal, white, burgundy\nDetails: crisp professional presentation",
    dystopian_survival:
      "Post-apocalyptic practical gear\nWardrobe: layered worn clothing, tactical elements\nFabrics: canvas, leather, distressed denim\nProps: backpacks, weapons, survival equipment\nAccessories: makeshift armor, gas masks, goggles\nDetails: weathered, patched, functional wear",
    futuristic_elements:
      "Sci-fi design language\nWardrobe: sleek synthetic fabrics, unusual cuts\nProps: glowing panels, holographic displays, tech devices\nMaterials: chrome, acrylic, LED integration\nDetails: clean lines, minimal texture, high-tech feel",
    high_fashion_editorial:
      "Runway and magazine styling\nWardrobe: avant-garde designer pieces, bold silhouettes\nFabrics: luxury materials, unusual textures\nAccessories: statement jewelry, artistic pieces\nStyling: dramatic, artistic, pushing boundaries\nDetails: high-concept fashion presentation",
    medical_clinical:
      "Hospital and medical facility setting\nWardrobe: scrubs, lab coats, medical uniforms\nProps: stethoscopes, clipboards, medical equipment\nFabrics: clinical cotton, sterile appearance\nColor palette: white, blue, green surgical colors\nDetails: clean, professional, functional",
    minimalist_modern:
      "Contemporary neutral tones\nWardrobe: clean lines, simple cuts, muted colors\nFabrics: quality cotton, wool, minimal patterns\nAccessories: understated modern pieces\nColor palette: blacks, grays, whites, navy, olive",
    natural_environment:
      "Outdoor organic elements\nEnvironment: trees, grass, water, rocks, sky\nDetails: wind movement, natural light interaction\nTextures: bark, stone, foliage, soil\nWeather: visible atmospheric conditions",
    period_accurate:
      "Era-specific costumes with authentic materials\nWardrobe: historically accurate cuts and fabrics\nAccessories: period-appropriate watches, jewelry, eyewear\nExtras: all background talent in period dress\nDetails: authentic buttons, zippers, stitching visible",
    practical_props:
      "Functional set dressing and handheld items\nProps: coffee cups, phones, bags, newspapers\nSet dressing: books, plants, clutter\nExtras: natural interaction with environment\nDetails: worn realistic items with history",
    streetwear_urban:
      "Contemporary street fashion\nWardrobe: hoodies, sneakers, branded athletic wear\nFabrics: jersey, denim, technical fabrics\nAccessories: caps, chains, backpacks, headphones\nStyling: layered, logo-prominent, youth culture\nDetails: brand-conscious, trend-aware aesthetic",
    vibrant_colorful:
      "Bold saturated color choices\nWardrobe: primary and secondary colors, patterns\nFabrics: varied textures creating visual interest\nAccessories: statement pieces, jewelry\nContrast: intentional color blocking and clashes",
  },
  sound: {
    none: "",
    action_intense:
      "High-energy action sound design\nEffects: impacts, explosions, whooshes at -15 LUFS\nMusic: driving rhythmic score at -18 LUFS\nDialogue: compressed for clarity at -12 LUFS\nDynamics: loud aggressive mixing\nEffect: adrenaline-pumping intensity",
    ambient_environmental:
      "Diegetic environmental sound only\nBackground: wind, traffic, nature sounds at -25 LUFS\nMid: footsteps, rustling, object interaction\nForeground: clear subject sounds\nNo music: pure environmental authenticity",
    binaural_immersive:
      "3D spatial audio for headphones\nPanning: accurate 360-degree positioning\nDistance: realistic proximity cues\nReverb: head-related transfer function\nEffect: hyper-realistic immersive soundscape\nFormat: binaural recording or processing",
    dialogue_driven:
      "Character conversation as primary audio\nDialogue: clear centered at -12 LUFS\nAmbient: reduced to -30 LUFS for clarity\nFootsteps: subtle at -20 LUFS\nEffect: intimate conversational focus",
    dramatic_music:
      "Non-diegetic score driving emotion\nMusic: orchestral or electronic score at -18 LUFS\nAmbient: reduced to support music\nDynamics: swells and crescendos for emphasis\nEffect: heightened emotional narrative",
    diegetic_source:
      "Music from visible source in scene\nSource: radio, musician, speaker visible or implied\nQuality: appropriate fidelity for source\nAmbient: natural room sound mixing with music\nEffect: naturalistic motivated audio",
    horror_tension:
      "Suspenseful atmospheric sound design\nAmbient: ominous low frequency drones at -30 LUFS\nEffects: distant creaks, whispers, stingers\nMusic: dissonant strings and textures\nSilence: strategic quiet for jump scares\nEffect: unease and dread",
    minimal_sound:
      "Sparse deliberate audio elements\nAmbient: barely perceptible room tone\nFoley: selective key sounds only\nSilence: intentional quiet moments\nEffect: contemplative, focused attention",
    retro_analog:
      "Vintage audio aesthetic\nQuality: tape hiss, vinyl crackle, warm distortion\nMusic: period-appropriate mono or stereo\nFrequency: rolled-off highs, limited bass response\nEffect: nostalgic analog warmth\nFormat: lo-fi vintage processing",
    silence_acoustics:
      "Natural room tone and reverb\nAmbient: minimal background at -40 LUFS\nReverb: natural acoustic space reflection\nFootsteps: clear with natural echo\nEffect: realistic spatial audio, no music",
    underwater_muffled:
      "Submerged audio perspective\nQuality: low-pass filtered, muffled clarity\nAmbient: aquatic bubbles and movement\nEffects: distorted underwater resonance\nDynamics: compressed distance perception\nEffect: submerged sensory isolation",
  },
}
