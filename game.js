// noinspection HtmlRequiredAltAttribute

console.log("Navigator platform is", navigator.platform)
console.log("User agent is", navigator.userAgent)

function determineAndLogBrowser() {
    // NOTE (mristin):
    // See https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browsers

    const browser = (function () {
        var test = function (regexp) {
            return regexp.test(window.navigator.userAgent)
        }
        switch (true) {
            case test(/edg/i):
                return "Microsoft Edge";
            case test(/trident/i):
                return "Microsoft Internet Explorer";
            case test(/firefox|fxios/i):
                return "Mozilla Firefox";
            case test(/opr\//i):
                return "Opera";
            case test(/ucbrowser/i):
                return "UC Browser";
            case test(/samsungbrowser/i):
                return "Samsung Browser";
            case test(/chrome|chromium|crios/i):
                return "Google Chrome";
            case test(/safari/i):
                return "Apple Safari";
            default:
                return "Other";
        }
    })();

    console.log("Detected browser is", browser);
}

determineAndLogBrowser()

import * as bodyPose from "./bodyPose.js";

const thiefMaxDistance = 10;

/**
 * @typedef {Object} Card
 * @property {string} question to be asked
 * @property {string} answer to be expected
 */

/**
 * @typedef {Object} Level
 * @property {string} caption to be displayed
 * @property {string} name to be announced
 * @property {Array<Card>} vocabulary to be learnt
 */

/**
 * @type {Array<Level>}
 */
const levels = [
    {
        name: "黄色",
        caption: "<img src='images/yellow-belt.png'> 黄色",
        vocabulary: [
            {
                question: "払腰",
                answer: "<img src='images/harai-goshi.jpg'>"
            },
            {
                question: "上四方固",
                answer: "<img src='images/kami-shiho-gatame.jpg'>"
            },
            {
                question: "小内刈",
                answer: "<img src='images/ko-uchi-gari.jpg'>"
            },
            {
                question: "袈裟固",
                answer: "<img src='images/kuzure-kesa-gatame.jpg'>"
            },
            {
                question: "大外刈",
                answer: "<img src='images/o-soto-gari.jpg'>"
            },
            {
                question: "大外落",
                answer: "<img src='images/o-soto-otoshi.jpg'>"
            },
            {
                question: "大内刈",
                answer: "<img src='images/o-uchi-gari.jpg'>"
            },
            {
                question: "体落",
                answer: "<img src='images/tai-otoshi.jpg'>"
            },
            {
                question: "縦四方固め",
                answer: "<img src='images/tate-shiho-gatame.jpg'>"
            },
            {
                question: "浮腰",
                answer: "<img src='images/uki-goshi.jpg'>"
            },
            {
                question: "横四方固め",
                answer: "<img src='images/yoko-shiho-gatame.png'>"
            },
        ]
    },

];

if (levels.length === 0) {
    throw new Error("DialogueSelectLevel expects at least one level.")
}

function assertEachLevelAtLeastTwoCards() {
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];

        if (level.vocabulary.length <= 1) {
            throw new Error(
                "Expected at least two vocabulary cards to shuffle, " +
                ` but got: ${level.vocabulary.length} cards` +
                ` at level ${i}`
            );
        }
    }
}

assertEachLevelAtLeastTwoCards();

function logAllQuestionsForAdaptationsToOtherLanguages() {
    // NOTE (mristin):
    // We log all the questions across all the levels facilitate adaptations
    // to other languages.
    const parts = [];
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];

        parts.push(`Level ${i}: ${level.name}\n`);

        for (let j = 0; j < level.vocabulary.length; j++) {
            const questionAnswer = level.vocabulary[j];
            parts.push(`Question ${j}: ${questionAnswer.question}\n`);
        }
    }

    console.log(parts.join(""))
}

logAllQuestionsForAdaptationsToOtherLanguages();

// NOTE (mristin):
// We distinguish between three types of states.
//
// The one state is the state of the overall system such as voice selection and
// gamepad selection. When the game restarts, the system state should not be
// affected.
//
// On the other hand, the other state, the dialogue state, concerns only the
// immediate dialogue logic and is devoid of any system concerns such as
// buttons pressed *etc.*
//
// The third state, the game state, concerns the over-arching game state which
// persists between the dialogues.

/**
 * Define a general dialogue, where the game goes from one dialogue to another,
 * akin to a state machine.
 *
 * @interface IDialogue
 */

/**
 * Generate the HTML code to be put into the game container.
 * @function
 * @name IDialogue#initialHTML
 * @returns {string}
 */

/**
 * Handle the hand raise.
 * @function
 * @name IDialogue#onHandRaised
 * @param {number} handEvent to be handled
 * @param {number} timestamp of the recognized video frame
 * @returns {void}
 */


/**
 * Update the dialogue state based on the timestamp.
 * @function
 * @name IDialogue#tick
 * @param {number} timestamp of the frame
 * @returns {void}
 */

/**
 * Refresh the game container based on the dialogue's state.
 * @function
 * @name IDialogue#refresh
 * @returns {void}
 */

/**
 * Execute the mount after the initial HTML code has been inserted.
 * @function
 * @name IDialogue#mount
 * @returns {void}
 */

/**
 * Execute the unmount just before the next dialogue is going to be mounted.
 * @function
 * @name IDialogue#unmount
 * @returns {void}
 */

/**
 * Ask the user to press a button so that we can activate the speech synthesis.
 * @implements IDialogue
 */
class DialoguePressHere {

    initialHTML() {
        return `<button class="announcement" id="press-start">
Click here when you are ready to start.
</button>`;
    }

    mount() {
        const pressStart = document.getElementById("press-start");
        pressStart.onclick = () => {
            dialoguer.put(new DialogueWaitingForSpeechSynthesis())
        };
    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Show that we are waiting for the speech synthesis to be initialized.
 * @implements IDialogue
 */
class DialogueWaitingForSpeechSynthesis {
    constructor() {
        this.retries = 4;
        this.lastTick = null;
    }

    initialHTML() {
        return `<div id="message" class="announcement">
Waiting for the speech synthesis to initialize...
</div>`;
    }

    mount() {
        // Intentionally empty.
    }

    refresh() {
        const messageDiv = document.getElementById("message");
        const dots = [];
        for (let i = 0; i < this.retries; i++) {
            dots.push(".")
        }

        updateInnerTextIfNeeded(
            messageDiv,
            "Waiting for the speech synthesis to initialize"
            + dots.join("")
        )
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        if (this.lastTick === null || timestamp - this.lastTick > 1000) {
            if (window.speechSynthesis.getVoices().length > 0) {
                setupSpeechSynthesis();
                dialoguer.put(new DialogueAskForVideo());
            } else {
                this.retries--;

                if (this.retries === 0) {
                    dialoguer.put(new DialogueNoSpeechSynthesisAvailable());
                }
            }

            this.lastTick = timestamp;
        }
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Inform the user that the game can not be played as there is no speech
 * synthesis.
 * @implements IDialogue
 */
class DialogueNoSpeechSynthesisAvailable {
    initialHTML() {
        return `<div class='announcement'>
No speech synthesis is available in your browser. Perhaps you have no 
internet connection and your browser needs one for speech synthesis?
</div>`;
    }

    mount() {
        // Intentionally empty.
    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Ask the user for video and start recognizing.
 * @implements IDialogue
 */
class DialogueAskForVideo {
    initialHTML() {
        return `<div id="message" class="announcement">
Waiting for the video recognition to initialize...
</div>`;
    }

    mount() {
        const args = {
            container: document.getElementById("video-container"),
            width: 280,
            height: 160,
            callback: function (pose, timestamp) {
                // Intentionally empty, only for initialization.
            }
        };

        const handler = bodyPose.newHandRaisingHandler(
            systemState.onHandRaised
        );

        args.callback = function (pose, timestamp) {
            // We switch to the actual handler on the first recognized frame.
            handler(pose, timestamp);

            args.callback = handler;
            dialoguer.put(new DialogueSelectLevel());
        }

        bodyPose
            .initializeRecognition(args)
            .catch((error) => {
                console.error("Error with the video recognition:", error);
                dialoguer.put(new DialogueNoVideoRecognition());
            });
    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Inform the user that the game can not be played as there is no video
 * recognition.
 * @implements IDialogue
 */
class DialogueNoVideoRecognition {
    initialHTML() {
        return `<div class='announcement'>
No video recognition is available in your browser. Perhaps you have no 
internet connection or you did not allow video access?
</div>`;
    }

    mount() {
        // Intentionally empty.
    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Let the user select the level.
 * @implements IDialogue
 */
class DialogueSelectLevel {
    constructor() {
        this.levelIndex = gameState.levelIndex;
    }

    initialHTML() {
        const parts = [
            `<div class="announcement">
Select the level:
</div>`
        ];
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            parts.push(
                `<button 
    id="level-${i}" 
    class="level-choice"
>${level.caption}</button>`
            )
        }

        return parts.join("\n");
    }

    announceLevel() {
        if (this.levelIndex < 0 || this.levelIndex >= levels.length) {
            throw new Error(
                `The level index ${this.levelIndex} is invalid; there are ` +
                `in total ${levels.length} levels.`
            )
        }

        announce(levels[this.levelIndex].name)
            .catch(
                (err) => console.log("Failed to announce the level", err)
            );
    }

    mount() {
        for (let i = 0; i < levels.length; i++) {
            /**
             * @type {HTMLButtonElement}
             */
            const button = document.getElementById(`level-${i}`);
            button.onclick = ((anI) => {
                return () => {
                    this.levelIndex = anI;
                    this.startTheGame();
                }
            })(i);

            addClassIfNeeded(button, "level-choice");
            if (i < levels.length - 1) {
                button.style.paddingRight = "1em";
            }
        }

        this.announceLevel();
    }

    startTheGame() {
        gameState.levelIndex = this.levelIndex;
        dialoguer.put(new DialogueHello());
    }

    /**
     * @param {number } delta
     */
    changeSelection(delta) {
        if (this.levelIndex + delta < 0) {
            this.levelIndex = levels.length + (this.levelIndex + delta);
        } else {
            this.levelIndex = (this.levelIndex + delta) % levels.length;
        }

        this.announceLevel();
    }

    onHandRaised(handEvent, _) {
        if (handEvent === bodyPose.HandEvent.LeftRaised) {
            this.changeSelection(-1);
        } else if (handEvent === bodyPose.HandEvent.RightRaised) {
            this.changeSelection(+1);
        } else if (handEvent === bodyPose.HandEvent.BothRaised) {
            this.startTheGame();
        } else {
            // Pass.
        }
    }

    refresh() {
        for (let i = 0; i < levels.length; i++) {
            const button = document.getElementById(`level-${i}`);

            if (i === this.levelIndex) {
                addClassIfNeeded(button, "level-selected");
            } else {
                removeClassIfNeeded(button, "level-selected");
            }
        }
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

const hiMessages = [
    "はじめ!"
]

/**
 * Say hello to the user to announce that the game is about to start.
 * @implements IDialogue
 */
class DialogueHello {
    initialHTML() {
        return `<div id="hello-container">
    <div id="hello">👋 はじめ ! 👋</div>
</div>`;
    }

    mount() {
        const messageIndex = Math.floor(Math.random() * hiMessages.length);
        announce(hiMessages[messageIndex])
            .catch(
                (err) => console.log(
                    "Failed to announce the start of the game", err
                )
            )
            .then(
                () => {
                    dialoguer.put(new DialoguePlay())
                }
            );
    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        // Intentionally empty.
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Play the game.
 * @implements IDialogue
 */
class DialoguePlay {
    constructor() {
        if (gameState.levelIndex < 0 || gameState.levelIndex >= levels.length) {
            throw new Error(
                "The level index is invalid; " +
                `there are ${levels.length} level(s), ` +
                `but we got level index ${gameState.levelIndex}`
            );
        }

        const level = levels[gameState.levelIndex];

        // See the assertion assertEachLevelAtLeastTwoCards for the assumption
        // that there are at least two cards to shuffle.

        const shuffledVocab = shuffle(level.vocabulary);

        const remainingQuestions = [];
        for (let i = 0; i < shuffledVocab.length; i++) {
            const card = shuffledVocab[i];

            let answers = [
                {text: card.answer, correct: true}
            ];

            let anotherAnswerIndex = i;
            while (anotherAnswerIndex === i) {
                anotherAnswerIndex = Math.floor(
                    Math.random() * shuffledVocab.length
                );
            }
            answers.push(
                {
                    text: shuffledVocab[anotherAnswerIndex].answer,
                    correct: false
                }
            )
            answers = shuffle(answers)

            let correctAnswerIndex = -1;
            for (let j = 0; j < answers.length; j++) {
                if (answers[j].correct) {
                    correctAnswerIndex = j;
                    break;
                }
            }

            if (answers.length !== 2) {
                throw new Error(
                    "Expected exactly 2 answers, " +
                    `but got ${answers.length}  answer(s) ` +
                    `for question ${card.question}`
                )
            }

            remainingQuestions.push(
                {
                    question: card.question,
                    answers: answers,
                    correctAnswerIndex: correctAnswerIndex
                }
            )
        }

        this.remainingQuestions = remainingQuestions;
        this.questionIndex = 0;
        this.solvedQuestions = [];

        this.thiefDistance = 1;
        this.thiefDirection = 1;
        this.thiefTimestamp = 0;

        this.askingId = null;  // set when the question is asked
    }

    playMistake() {
        const audio = new Audio("negative.mp3");
        audio.volume = 0.1;
        audio.play().catch(
            reason => console.log("Failed to play negative sound", reason)
        );
    }

    playSuccess() {
        const audio = new Audio("positive.mp3");
        audio.volume = 0.1;
        audio.play().catch(
            reason => console.log("Failed to play positive sound", reason)
        );
    }

    playStolen() {
        const audio = new Audio("stone.mp3");
        audio.volume = 0.1;
        audio.play().catch(
            reason => console.log("Failed to play stolen sound", reason)
        );
    }

    askTheQuestion() {
        if (this.remainingQuestions.length === 0) {
            throw new Error(
                "Unexpected asking the question when there are " +
                "no remaining questions."
            )
        }
        if (this.questionIndex === null) {
            throw new Error(
                "Expected question index to be set when remaining questions " +
                "still available."
            )
        }
        if (this.questionIndex >= this.remainingQuestions.length) {
            throw new Error(
                `Unexpected question index ${this.questionIndex} ` +
                `when there are ${this.remainingQuestions.length} ` +
                "remaining question(s)."
            )
        }

        const question = this.remainingQuestions[this.questionIndex];
        const text = question.question;

        console.log(
            `Asking the question at index ${this.questionIndex} out of ` +
            `${this.remainingQuestions.length} remaining questions: ${text}`
        );

        if (systemState.speechSynthesisVoice === null) {
            return;
        }

        let utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        utterance.voice = systemState.speechSynthesisVoice;

        // Delay a bit so that we do not conflict with the feedback sounds
        this.askingId = setTimeout(
            () => {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            },
            500
        );
    }

    /**
     * Effectuate the answer
     * @param {number} direction
     */
    answer(direction) {
        if (direction !== 0 && direction !== 1) {
            throw new Error(
                `Expected only 0 and 1 direction, but got: ${direction}`
            );
        }
        if (this.remainingQuestions.length === 0) {
            throw new Error(
                "Unexpected call to the answer method when " +
                "there are no remaining questions."
            )
        }
        if (this.questionIndex >= this.remainingQuestions.length) {
            throw new Error(
                `Unexpected question index ${this.questionIndex} ` +
                `when there are ${this.remainingQuestions.length} ` +
                "remaining question(s)."
            )
        }

        const question = this.remainingQuestions[this.questionIndex];

        if (question.correctAnswerIndex === direction) {
            this.playSuccess();

            const solvedQuestionAsArray = this.remainingQuestions.splice(
                this.questionIndex, 1
            );
            if (solvedQuestionAsArray.length !== 1) {
                throw new Error(
                    "Expected exactly one question to be removed from " +
                    "remaining questions, " +
                    `but we removed ${solvedQuestionAsArray.length}`
                )
            }

            this.solvedQuestions.push(solvedQuestionAsArray[0]);

            this.thiefDistance = Math.max(
                thiefMaxDistance,
                this.thiefDistance + 1
            );

            console.log(
                `The answer was correct. Now you have ` +
                `${this.solvedQuestions} solved question(s) ` +
                `and ${this.remainingQuestions.length} remaining questions. `
            )

            if (this.remainingQuestions.length === 0) {
                console.log(
                    "Since there are no remaining questions, we move to " +
                    "the bravo dialogue."
                )
                dialoguer.put(new DialogueBravo())
            } else {
                console.log(
                    `The question at index ${this.questionIndex} has been ` +
                    `answered correctly.`
                )
                this.questionIndex = (
                    this.questionIndex % this.remainingQuestions.length
                );
                console.log(
                    `We are now going to ask the question ` +
                    `at index ${this.questionIndex} in the array of ` +
                    `${this.remainingQuestions.length} remaining question(s).`
                )
                this.askTheQuestion();
            }
        } else {
            console.log(
                `We made a mistake at answering the question ` +
                `at index ${this.questionIndex} out of ` +
                `${this.remainingQuestions.length} remaining question(s).`
            )
            this.playMistake();
            this.questionIndex = (
                (this.questionIndex + 1) % this.remainingQuestions.length
            );

            console.log(
                `We are now moving to ask the next question, ` +
                `at index ${this.questionIndex}, out of ` +
                `${this.remainingQuestions.length} remaining question(s).`
            )
            this.askTheQuestion();
        }
    }

    initialHTML() {
        return `<div id="answer-container">
    <button id="left-answer" class="answer">
        &leftarrow;
    </button>
    <button id="right-answer" class="answer">
        &rightarrow;
    </button>
</div>


<div id="terrain">
    <span id="score">💎💎💎</span><span id="thief-distance"></span><span id="thief">👻</span>
</div>`;
    }

    restart() {
        dialoguer.put(new DialogueSelectLevel())
    }

    mount() {
        const that = this;

        document.getElementById("left-answer").onclick = () => {
            console.log("Received click on the left answer.")
            that.answer(0);
        };
        document.getElementById("right-answer").onclick = () => {
            console.log("Received click on the right answer.")
            that.answer(1);
        }

        this.askTheQuestion()
    }

    onHandRaised(handEvent, _) {
        if (handEvent === bodyPose.HandEvent.LeftRaised) {
            this.answer(0);
        } else if (handEvent === bodyPose.HandEvent.RightRaised) {
            this.answer(1);
        } else if (handEvent === bodyPose.HandEvent.BothRaised) {
            this.restart();
        } else {
            // Pass.
        }
    }

    refreshQuestion() {
        if (this.remainingQuestions.length === 0) {
            throw new Error(
                "Unexpected no remaining questions during the play dialogue."
            )
        }

        if (this.questionIndex >= this.remainingQuestions.length) {
            throw new Error(
                `Unexpected question index ${this.questionIndex} ` +
                `when there are ${this.remainingQuestions.length} ` +
                "remaining question(s)."
            )
        }

        const question = this.remainingQuestions[this.questionIndex];

        if (question === undefined) {
            throw new Error(
                "Unexpected undefined question " +
                `for question index ${this.questionIndex} and when there are ` +
                `${this.remainingQuestions.length} remaining question(s).`
            )
        }

        if (question.answers === undefined) {
            console.error("question", question)
            throw new Error(
                "Unexpected undefined answers for a question, see error log."
            )
        }

        updateInnerHTMLIfNeeded(
            document.getElementById("left-answer"),
            question.answers[0].text
        );

        updateInnerHTMLIfNeeded(
            document.getElementById("right-answer"),
            question.answers[1].text
        );
    }

    refreshScore() {
        /**
         * @type {Array<string>}
         */
        const diamonds = [];
        for (let i = 0; i < this.solvedQuestions.length; i++) {
            diamonds.push("💎");
        }

        const text = diamonds.join("");
        updateInnerTextIfNeeded(
            document.getElementById("score"),
            text
        );
    }

    refreshThief() {
        const parts = [];
        for (let i = 0; i < this.thiefDistance; i++) {
            parts.push("&nbsp;");
        }
        document.getElementById("thief-distance").innerHTML = (
            parts.join("")
        );
    }


    refresh() {
        this.refreshQuestion();
        this.refreshScore();
        this.refreshThief();
    }

    tick(timestamp) {
        const temporalDelta = timestamp - this.thiefTimestamp;
        if (this.solvedQuestions.length > 0 && temporalDelta > 1000) {
            const spatialDelta = Math.round(temporalDelta / 1000);
            this.thiefDistance = Math.min(
                Math.max(
                    0,
                    this.thiefDistance + this.thiefDirection * spatialDelta
                ),
                thiefMaxDistance
            );

            if (
                this.thiefDistance === 0
                || this.thiefDistance === thiefMaxDistance
            ) {
                this.thiefDirection = -1 * this.thiefDirection;
            }

            if (this.thiefDistance === 0) {
                this.playStolen();
                const stolenQuestion = this.solvedQuestions.pop();
                if (stolenQuestion === undefined) {
                    throw new Error(
                        "Stolen question was undefined. The question index " +
                        `is ${this.questionIndex}, while there are ` +
                        `${this.solvedQuestions.length} solved question(s) ` +
                        `and ${this.remainingQuestions} remaining question(s).`
                    )
                }
                this.remainingQuestions.push(stolenQuestion);
            }

            this.thiefTimestamp = timestamp;
        }
    }

    unmount() {
        if (this.askingId !== null) {
            clearTimeout(this.askingId);
        }
    }
}

const bravoMessages = [
    "待って. ブラボー！",
    "待って. よくやった！"
]

/**
 * Congratulate the player and finish the game.
 * @implements IDialogue
 */
class DialogueBravo {

    initialHTML() {
        return `<div id="bravo-container">
    <div id="bravo">👏 待って ! 👏</div>
    <button id="restart">Restart</button>
</div>`;
    }

    restart() {
        dialoguer.put(new DialogueSelectLevel())
    }

    mount() {
        document.getElementById("restart").onclick = () => {
            this.restart()
        }

        const messageIndex = Math.floor(Math.random() * bravoMessages.length);
        announce(bravoMessages[messageIndex])
            .catch(err => {
                console.log("Failed to say bravo", err)
            })


    }

    refresh() {
        // Intentionally empty.
    }

    onHandRaised(handEvent, timestamp) {
        if (handEvent === bodyPose.HandEvent.BothRaised) {
            this.restart();
        }
    }

    tick(timestamp) {
        // Intentionally empty.
    }

    unmount() {
        // Intentionally empty.
    }
}

/**
 * Handle dialogue changes.
 */
class Dialoguer {
    constructor() {
        /**
         * Current dialogue
         * @type {IDialogue | null}
         */
        this.dialogue = null;
    }

    /**
     * Change the dialogue.
     * @param {IDialogue} dialogue
     */
    put(dialogue) {
        if (this.dialogue !== null) {
            this.dialogue.unmount();
        }

        this.dialogue = dialogue;

        const gameContainer = document.getElementById("game-container");
        gameContainer.innerHTML = this.dialogue.initialHTML();
        this.dialogue.mount();
    }
}

const dialoguer = new Dialoguer();

const systemState = {
    speechSynthesisVoice: null,
    onHandRaised: function (handEvent, timestamp) {
        console.log("Hand event observed: ", handEvent);

        if (dialoguer.dialogue !== null) {
            dialoguer.dialogue.onHandRaised(handEvent, timestamp);
        }
    }
}

const gameState = {
    levelIndex: 0
}


/**
 * Make a copy of the array and shuffle it.
 * @param {Array<T>} array to be shuffled
 * @returns {Array<T>} shuffled items
 * @template T
 */
function shuffle(array) {
    const shuffled = [...array];
    shuffled.sort(() => Math.random() - 0.5);
    return shuffled;
}

function setupSpeechSynthesis() {
    systemState.speechSynthesisVoice = null;

    if (window.speechSynthesis === undefined) {
        return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices === null || voices === undefined || voices.length === 0) {
        return;
    }

    for (let i = 0; i < voices.length; i++) {
        const lang = voices[i].lang.toLowerCase();
        if (lang === "ja" || lang.startsWith("ja-")) {
            const voice = voices[i];

            if (systemState.speechSynthesisVoice !== voice) {
                systemState.speechSynthesisVoice = voice;
            }
        }
    }
}

/**
 * Announce the text to the user.
 * @param text to be announced
 * @returns {Promise<void>}
 */
function announce(text) {
    console.log(`Announcing: ${text}`)
    if (systemState.speechSynthesisVoice === null) {
        return new Promise((resolve, _) => {
            console.log("No speech synthesis voice.")
            resolve()
        });
    }

    let utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    utterance.voice = systemState.speechSynthesisVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance)

    return new Promise((resolve, reject) => {
        utterance.onend = resolve;
        utterance.onerror = (errorEvent) => {
            if (errorEvent.error === 'interrupted') {
                resolve();
            } else {
                reject(errorEvent)
            }
        }
    })
}


const dummyElementForHTMLCanonicalization = document.createElement(
    "div"
);

/**
 * Update the inner HTML of the element if it differs from the given text.
 * @param {HTMLElement} element
 * @param {string} code HTML code
 */
function updateInnerHTMLIfNeeded(element, code) {
    dummyElementForHTMLCanonicalization.innerHTML = code;
    const canonicalized = dummyElementForHTMLCanonicalization.innerHTML;

    if (canonicalized !== element.innerHTML) {
        element.innerHTML = canonicalized;
    }
}

/**
 * Update the inner text of the element if it differs from the given text.
 * @param {HTMLElement} element
 * @param {string} text
 */
function updateInnerTextIfNeeded(element, text) {
    if (element.innerText !== text) {
        element.innerText = text;
    }
}

/**
 * Add the style class if it is not already present in the element.
 * @param {HTMLElement} element
 * @param {string} cls
 */
function addClassIfNeeded(element, cls) {
    if (!element.classList.contains(cls)) {
        element.classList.add(cls)
    }
}

/**
 * Remove the style class if it is not already absent from the element.
 * @param {HTMLElement} element
 * @param {string} cls
 */
function removeClassIfNeeded(element, cls) {
    if (element.classList.contains(cls)) {
        element.classList.remove(cls)
    }
}

/**
 * Handle every frame redrawing.
 * @param {number} timestamp
 */
function handleFrame(timestamp) {
    if (dialoguer.dialogue !== null) {
        dialoguer.dialogue.tick(timestamp);
        dialoguer.dialogue.refresh();
    }

    requestAnimationFrame(handleFrame);
}

function main() {
    dialoguer.put(new DialoguePressHere());
    requestAnimationFrame(handleFrame);
}

window.onload = main;
