// src/utils/NarrativeFrameworks.js

const TROPE_BLACKLIST = [
    "obsidian", "echoes", "symphony", "tapestry", "conduit", "resonance",
    "ethereal", "dance", "ballet", "cacophony", "labyrinth", "crucible",
    "testament", "kaleidoscope", "nexus", "whispers", "shimmering", "pulse",
    "fractal", "enigma"
];

const HARMON_STORY_CIRCLE = {
    name: "Dan Harmon's Story Circle",
    steps: [
        { step: 1, title: "YOU", description: "Establish the protagonist in their comfort zone. Do NOT introduce the main conflict yet. Focus on their ordinary life and status quo." },
        { step: 2, title: "NEED", description: "Establish a lack or desire. The protagonist wants something, but hasn't acted yet. Do NOT resolve anything. Build internal tension." },
        { step: 3, title: "GO", description: "The protagonist crosses the threshold into a new, unfamiliar situation. This is the point of no return. Focus on the transition." },
        { step: 4, title: "SEARCH", description: "The road of trials. The protagonist adapts to the new world, facing minor obstacles. Do NOT introduce the climax. Focus on learning and struggling." },
        { step: 5, title: "FIND", description: "The protagonist gets what they wanted, but it's not what they expected or comes with a heavy realization. A moment of false victory or heavy truth." },
        { step: 6, title: "TAKE", description: "The protagonist pays a heavy price for what they found. Things go terribly wrong. This is the lowest point or the start of the climax." },
        { step: 7, title: "RETURN", description: "The protagonist heads back to their familiar situation, bringing the new knowledge or item. The climax resolves here." },
        { step: 8, title: "CHANGE", description: "The protagonist is back where they started, but fundamentally changed. The resolution. Establish the new normal." }
    ],
    getStepInstruction: (stepNumber) => {
        const boundedIndex = Math.min(Math.max(stepNumber - 1, 0), 7);
        const currentStep = HARMON_STORY_CIRCLE.steps[boundedIndex];
        
        let pacingCue = "";
        if (stepNumber >= 9) {
            pacingCue = "PACING CUE: THE END. This is the final conclusion of the story. Write a definitive ending. Do not leave cliffhangers. Bring the narrative to a complete and satisfying close.";
        } else if (stepNumber === 8) {
            pacingCue = "PACING CUE: This is the final phase of the story. Wrap up the core narrative threads. Provide a satisfying conclusion to the character's journey.";
        } else {
            pacingCue = "PACING CUE: This phase can last as long as necessary. Focus entirely on the themes of this step. Do not rush to the next step until the user explicitly commands it.";
        }

        return `=========================================
NARRATIVE FRAMEWORK: ${HARMON_STORY_CIRCLE.name}
CURRENT STORY STEP: ${currentStep.step} of 8 - ${currentStep.title}
DIRECTOR'S PHASE OBJECTIVE: ${currentStep.description}
${pacingCue}
=========================================`;
    }
};

module.exports = {
    TROPE_BLACKLIST,
    HARMON_STORY_CIRCLE
};
