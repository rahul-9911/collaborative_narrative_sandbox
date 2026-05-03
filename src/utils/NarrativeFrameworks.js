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
    getStepInstruction: (chapterDepth, chaptersPerStep = 2) => {
        const stepIndex = Math.floor((chapterDepth - 1) / chaptersPerStep);
        const boundedIndex = Math.min(Math.max(stepIndex, 0), 7);
        const currentStep = HARMON_STORY_CIRCLE.steps[boundedIndex];
        
        // Calculate sub-phase pacing
        const positionInStep = (chapterDepth - 1) % chaptersPerStep;
        let pacingCue = "";
        
        if (chaptersPerStep > 1) {
            if (positionInStep === 0) {
                pacingCue = "PACING CUE: This is the beginning of this narrative phase. Introduce the themes of this step gradually.";
            } else if (positionInStep === chaptersPerStep - 1) {
                pacingCue = "PACING CUE: This is the concluding chapter of this narrative phase. Bring the themes of this step to a climax and prepare to transition the story forward.";
            } else {
                pacingCue = "PACING CUE: We are in the middle of this narrative phase. Continue exploring the current themes deeply without rushing to a conclusion.";
            }
        }

        return `NARRATIVE FRAMEWORK: ${HARMON_STORY_CIRCLE.name}
CURRENT STEP: ${currentStep.step} - ${currentStep.title}
DIRECTOR'S CONSTRAINT: ${currentStep.description}
${pacingCue}`;
    }
};

module.exports = {
    TROPE_BLACKLIST,
    HARMON_STORY_CIRCLE
};
