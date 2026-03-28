import { useState } from 'react';
import pic2 from '../pictures/pic2.jpg';
// All quiz data copied from the original about.html
const quizData = [
  {
    question: "Where is Agoo Park located?",
    options: ["Barangay Sta. Rita, Agoo", "Barangay Paraoir, Balaoan", "San Fernando City Proper", "Barangay Damortis"],
    answer: 0
  },
  {
    question: "Why are bamboo and nipa materials used in structures inside Agoo Eco Park?",
    options: ["For educational only", "To reduce environmental impact", "Because concrete is banned", "Because they imported"],
    answer: 1
  },
  {
    question: "What is Immuki Island famous for?",
    options: ["Rice terraces", "Three crystal-clear lagoons", "Volcano crater", "Desert landscape"],
    answer: 1
  },
  {
    question: "Immuki Island is located in which town of La Union?",
    options: ["San Juan", "Agoo", "Balaoan", "Rosario"],
    answer: 2
  },
  {
    question: "What was the old name of Immuki Island according to local history?",
    options: ["Kaparingitan", "Darigayos", "Namacpacan", "Poro point"],
    answer: 0
  }
];

function AboutPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState('');
  const [resultColor, setResultColor] = useState('green');
  const [quizDone, setQuizDone] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    setSubmitDisabled(false);
  };

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    const current = quizData[currentIdx];

    if (selectedIdx === current.answer) {
      setScore(s => s + 1);
      setResultColor('green');
      setResult('Correct!');
    } else {
      setResultColor('red');
      setResult(`Wrong! Correct answer: ${current.options[current.answer]}`);
    }
    setSubmitDisabled(true);

    // Move to next question after 1.5 seconds
    setTimeout(() => {
      const next = currentIdx + 1;
      if (next < quizData.length) {
        setCurrentIdx(next);
        setSelectedIdx(null);
        setResult('');
        setSubmitDisabled(true);
      } else {
        setQuizDone(true);
      }
    }, 1500);
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setResult('');
    setSubmitDisabled(true);
    setQuizDone(false);
  };

  return (
    <main className="content">
      {/* Travel Diary section — from original about.html */}
      <div className="container">
        <h1>My Travel Diary</h1>
        <p>
          Adventure begins the moment you step outside your comfort zone.
          The unknown becomes your greatest teacher. The journey changes you forever.
        </p>
        <img src={pic2} alt="Me exploring" />
      </div>

      {/* Timeline section — from original about.html */}
      <div className="container">
        <h2>Timeline of Trips</h2>
        <ul>
          <li><strong>2020:</strong> Explored town trails.</li>
          <li><strong>2022:</strong> Road trip to the nearest town.</li>
          <li><strong>2024:</strong> Visited every beach in the province.</li>
        </ul>
        <blockquote>
          "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes." — Marcel Proust
        </blockquote>
      </div>

      {/* Quiz section — converted from inline script in about.html */}
      <div className="quiz-container">
        {quizDone ? (
          <>
            <h2>Quiz Complete!</h2>
            <div style={{ fontWeight: 'bold', marginTop: '20px', color: 'white' }}>
              Your final score is {score} out of {quizData.length}.
            </div>
            <button className="quiz-submit-btn" style={{ marginTop: '20px' }} onClick={handleRetake}>
              Retake Quiz
            </button>
          </>
        ) : (
          <>
            <h2>{quizData[currentIdx].question}</h2>
            <div className="options">
              {quizData[currentIdx].options.map((opt, i) => (
                <div
                  key={i}
                  className={`option${selectedIdx === i ? ' selected' : ''}`}
                  onClick={() => handleSelect(i)}
                >
                  {opt}
                </div>
              ))}
            </div>
            <button
              className="quiz-submit-btn"
              disabled={submitDisabled}
              onClick={handleSubmit}
            >
              Submit Answer
            </button>
            {result && (
              <div style={{ marginTop: '20px', fontWeight: 'bold', color: resultColor }}>
                {result}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default AboutPage;