import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = (typeof window !== 'undefined' && window.__firebase_config)
  ? JSON.parse(window.__firebase_config)
  : {
    apiKey: "AIzaSyCCGbZc4zEDgbaEhEWpg1rzCHKLQeKHthQ",
    authDomain: "iam-calendar-179e8.firebaseapp.com",
    projectId: "iam-calendar-179e8",
    storageBucket: "iam-calendar-179e8.firebasestorage.app",
    messagingSenderId: "1005875650817",
    appId: "1:1005875650817:web:d6cf5eb571af10d2053b00"
  };

// Updated appId for the Men's Ministry challenge
const appId = (typeof window !== 'undefined' && window.__app_id) 
  ? window.__app_id 
  : 'hwayang-men-challenge-react-october';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Declarations for 31 days of October
const declarations = [
  "나는 하나님의 사랑받는 자녀입니다", "나는 하나님의 형상입니다", "나는 하늘나라 상속자입니다", "나는 하늘나라 시민권자입니다", "나는 하나님께 시선을 두는 자녀입니다", "나는 그리스도의 심판대에서 생각합니다", "나는 하나님 보시기에 심히 좋은 존재입니다", "나는 예수님만큼 가치 있는 존재입니다", "나는 주안에서 기뻐하는 자입니다", "나는 새사람의 정체성으로 살아갑니다", "나는 감사로 문을 열어갑니다", "나는 이기며 승리하는 권세가 있습니다", "나는 말과 혀로 가정을 살리는 자입니다", "나는 그리스도와 연합된 존재입니다", "나는 삶을 인도하시는 하나님을 신뢰합니다", "나는 영혼이 잘됨 같이 범사도 잘됩니다", "나는 믿음을 선포하는 자입니다", "나는 감사로 상황을 돌파합니다", "나는 어떤 상황에서도 하나님을 찬양합니다", "나는 누구보다 존귀한 자녀입니다", "나는 예수님과 함께 걸어갑니다", "나는 어둠을 몰아내는 빛입니다", "나는 기도하며 낙심하지 않는 자입니다", "나는 빛 가운데 걸어가는 자녀입니다", "나는 기도 응답을 풍성히 누립니다", "나는 소망 가운데 인내합니다", "나는 내 생각보다 크신 하나님의 계획을 신뢰합니다", "나는 하나님의 말씀에 삶의 기준을 두는 자녀입니다", "나는 하나님의 평강을 누리는 자녀입니다", "나는 예수님처럼 용서하는 자녀입니다", "나는 가정의 영적 제사장입니다."
];

// Declaration count is 10
const MAX_DECLARATION_COUNT = 10;
const challengeYear = 2025;
const challengeMonth = 9; // 0-indexed, 9 is October
// Updated storage key for the Men's Ministry challenge
const USERNAME_STORAGE_KEY = 'hwayangMenChallengeUserInfoReactOctober';
const CHALLENGE_ID = `october${challengeYear}`;

const getInitialDateStatus = () => {
  const status = {};
  for (let i = 1; i <= declarations.length; i++) {
    status[i.toString()] = { count: 0, completed: false };
  }
  return status;
};

function CalendarModal({ date, declaration, onClose, onDeclare, currentCount, isCompleted }) {
  const handleDeclareClick = () => { if (!isCompleted) { onDeclare(); } };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md text-center border-2 border-teal-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{`${challengeYear}년 ${challengeMonth + 1}월 ${date}일`}</h3>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">"{declaration}"</p>
        <div className="flex flex-col items-center">
          <button onClick={handleDeclareClick} disabled={isCompleted} className={`px-6 py-3 mb-4 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 shadow-md'}`}>
            {isCompleted ? `선포 완료!` : `정체성 선포하기 (${currentCount}/${MAX_DECLARATION_COUNT})`}
          </button>
          <button onClick={onClose} className="px-5 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">닫기</button>
        </div>
      </div>
    </div>
  );
}

function FinalCompletionModal({ userName, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-yellow-200 to-orange-200 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-4 border-white animate-bounce-in">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">{userName}님 축복합니다! 🎉</h3>
        <p className="text-xl text-gray-800 mb-6 font-semibold">
          화양교회 남선교회 정체성 선포 챌린지 완주를 축하합니다!
          새사람의 정체성을 선포하며 계속해서 승리하세요!
        </p>
        <button onClick={onClose} className="px-8 py-3 bg-white text-gray-800 font-bold text-lg rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">확인</button>
      </div>
    </div>
  );
}

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dateStatuses, setDateStatuses] = useState(getInitialDateStatus());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [cellInput, setCellInput] = useState('');
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);

  // Load user name from localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedUserInfo) {
      try {
        const parsedInfo = JSON.parse(storedUserInfo);
        if (parsedInfo && parsedInfo.name && parsedInfo.cell) {
          setUserInfo(parsedInfo);
          setIsAppReady(true);
        }
      } catch (e) {
        localStorage.removeItem(USERNAME_STORAGE_KEY);
      }
    }
  }, []);

  // Firebase Authentication
  useEffect(() => {
    const hostToken = (typeof window !== 'undefined' && window.__initial_auth_token) ? window.__initial_auth_token : null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      let currentUserId = null;
      if (user) {
        currentUserId = user.uid;
      } else if (hostToken) {
        try {
          const userCredential = await signInWithCustomToken(auth, hostToken);
          currentUserId = userCredential.user.uid;
        } catch (error) {
          console.error("Custom token sign-in failed, trying anonymous:", error);
          try {
            const anonUser = await signInAnonymously(auth);
            currentUserId = anonUser.user.uid;
          } catch (anonError) {
            console.error("Anonymous sign-in failed:", anonError);
          }
        }
      } else {
        try {
          const anonUser = await signInAnonymously(auth);
          currentUserId = anonUser.user.uid;
        } catch (error) {
          console.error("Default anonymous sign-in failed", error);
        }
      }
      setUserId(currentUserId);
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore data loading
  useEffect(() => {
    if (userId && isAppReady) {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/doodeurim_challenge_status`, CHALLENGE_ID);
      const unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
        const initialStatuses = getInitialDateStatus();
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          for (const dayKey in initialStatuses) {
            if (firestoreData[dayKey]) {
              initialStatuses[dayKey] = { ...initialStatuses[dayKey], ...firestoreData[dayKey] };
            }
          }
        }
        setDateStatuses(initialStatuses);
      });
      return () => unsubscribeFirestore();
    }
  }, [userId, isAppReady]);
  
  // Background Music Logic
  const toggleMusic = useCallback(() => {
    if (!audioContextRef.current) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            oscillatorRef.current = audioContextRef.current.createOscillator();
            gainRef.current = audioContextRef.current.createGain();
            oscillatorRef.current.type = 'sine';
            oscillatorRef.current.connect(gainRef.current);
            gainRef.current.connect(audioContextRef.current.destination);
            gainRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
            oscillatorRef.current.start();
        } catch (e) {
            console.error("Web Audio API not supported", e);
            return;
        }
    }

    if (isMusicPlaying) {
        clearTimeout(sequenceTimeoutRef.current);
        gainRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        gainRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.2);
        setIsMusicPlaying(false);
    } else {
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        let sequenceIndex = 0;
        const musicSequence = [
            { freq: 261.63, duration: 400 }, { freq: 329.63, duration: 400 },
            { freq: 392.00, duration: 400 }, { freq: 523.25, duration: 800 },
        ];
        const play = () => {
            const note = musicSequence[sequenceIndex % musicSequence.length];
            const now = audioContextRef.current.currentTime;
            oscillatorRef.current.frequency.setValueAtTime(note.freq, now);
            gainRef.current.gain.setValueAtTime(0, now).linearRampToValueAtTime(0.05, now + 0.05)
                           .linearRampToValueAtTime(0, now + (note.duration / 1000) - 0.05);
            sequenceIndex++;
            sequenceTimeoutRef.current = setTimeout(play, note.duration);
        };
        play();
        setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);
  
  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(e => console.error(e));
        }
    };
  }, []);


  const handleStartChallenge = () => {
    const name = nameInput.trim();
    const cell = cellInput.trim();
    if (!name || !cell) {
      alert("셀과 이름을 모두 입력해주세요.");
      return;
    }
    const userInfoData = { name, cell };
    localStorage.setItem(USERNAME_STORAGE_KEY, JSON.stringify(userInfoData));
    setUserInfo(userInfoData);
    setIsAppReady(true);
  };

  const isDateClickable = useCallback((day) => {
    if (isAuthLoading || !userId) return false;
    if (day === 1) return true;
    
    const prevDayKey = (day - 1).toString();
    const prevDayStatus = dateStatuses[prevDayKey];
    return prevDayStatus && prevDayStatus.completed;
  }, [dateStatuses, userId, isAuthLoading]);

  const handleDateClick = (day) => {
    if (isAuthLoading || !userId) {
      alert("데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (day > 0 && day <= declarations.length) {
        if(isDateClickable(day)){
            setSelectedDate(day);
            setIsModalOpen(true);
        } else {
            alert("이전 날짜의 선포를 먼저 완료해주세요!");
        }
    }
  };

  const saveDateStatusToFirestore = async (day, statusUpdate) => {
    if (!userId) return;
    const dayKey = day.toString();
    try {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/doodeurim_challenge_status`, CHALLENGE_ID);
      await setDoc(docRef, { [dayKey]: statusUpdate }, { merge: true });
    } catch (error) { console.error("Error saving date status:", error); }
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedDate(null); };

  const handleDeclare = async () => {
    if (!selectedDate || !userId) return;
    const dayKey = selectedDate.toString();
    const currentStatus = dateStatuses[dayKey];
    if (currentStatus.completed) return;
    
    const newCount = currentStatus.count + 1;
    const newCompleted = newCount >= MAX_DECLARATION_COUNT;
    const newStatus = { ...currentStatus, count: newCount, completed: newCompleted };
    
    setDateStatuses(prevStatuses => ({ ...prevStatuses, [dayKey]: newStatus }));
    await saveDateStatusToFirestore(selectedDate, newStatus);
    
    if (selectedDate === declarations.length && newCompleted) {
      setTimeout(() => setIsChallengeComplete(true), 500);
    }
    
    if (newCompleted) { setTimeout(handleCloseModal, 300); }
  };

  const daysInOctober2025 = 31;
  const firstDayOfMonth = new Date(challengeYear, challengeMonth, 1).getDay();
  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="border border-teal-200 p-1 h-24 sm:h-28 bg-black bg-opacity-5"></div>);
  }

  for (let day = 1; day <= daysInOctober2025; day++) {
    const dayKey = day.toString();
    const status = dateStatuses[dayKey] || { count: 0, completed: false };
    const isDayFullyCompleted = status.completed;
    const clickable = isDateClickable(day);

    calendarDays.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`relative border border-teal-200 p-1 h-24 sm:h-28 flex flex-col items-center justify-center transition-all duration-200
          ${isDayFullyCompleted ? 'bg-gradient-to-br from-green-300 to-teal-300 shadow-lg' : 'bg-white bg-opacity-50'}
          ${clickable ? 'cursor-pointer hover:bg-teal-100' : 'cursor-not-allowed opacity-70'}
        `}
      >
        <span className={`absolute top-1 left-2 text-sm sm:text-base font-bold ${isDayFullyCompleted ? 'text-green-900' : 'text-gray-700'}`}>{day}</span>
        <div className="text-xs sm:text-sm text-teal-700 font-semibold mt-2 px-1 text-center leading-tight">
            <span className="hidden sm:inline">정체성 </span>선포
        </div>
        <div className="flex items-center justify-center space-x-1.5 h-7 mt-2">
          <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }
  const dayLabels = ['주일', '월', '화', '수', '목', '금', '토'];

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-sky-200 flex items-center justify-center p-4 font-['Inter',_sans-serif]">
        <div className="w-full max-w-md bg-white bg-opacity-80 p-8 rounded-3xl shadow-2xl text-center border-t-4 border-l-4 border-teal-300 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-600 mb-2 drop-shadow-lg">화양교회 남선교회</h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-600 mb-4 drop-shadow-lg leading-tight text-center break-keep">정체성 선포 챌린지</h2>
          <p className="text-gray-600 text-lg mb-6">매일 선포의 능력으로 승리하세요</p>
          <input
            type="text" value={cellInput} onChange={(e) => setCellInput(e.target.value)}
            placeholder="셀을 입력하세요 (예: 화양셀)"
            className="w-full px-5 py-3 mb-4 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStartChallenge()}
            placeholder="이름을 입력하세요"
            className="w-full px-5 py-3 mb-6 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button onClick={handleStartChallenge} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg shadow-xl text-xl tracking-wide transition-all duration-300 transform hover:scale-105">
            챌린지 시작하기!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-sky-200 flex flex-col items-center p-4 sm:p-6 font-['Inter',_sans-serif]">
      <header className="text-center my-6 sm:my-8 w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-600 drop-shadow-lg">화양교회 남선교회</h1>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-600 drop-shadow-lg leading-tight mt-2 text-center break-keep">정체성 선포 챌린지</h2>
        <div className="inline-block mt-3 bg-white bg-opacity-50 px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="text-lg sm:text-xl text-slate-700 font-semibold">10월 한 달 동안 매일 선포</p>
          {userInfo && <p className="text-md sm:text-lg text-slate-600 mt-1">({userInfo.cell} {userInfo.name}님)</p>}
          {userId && <p className="text-xs text-slate-500 mt-1 break-all">User ID: {userId}</p>}
        </div>
      </header>

      <main className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-2xl lg:max-w-3xl border-t-4 border-l-4 border-teal-300">
        <div className="grid grid-cols-7 gap-px bg-teal-300 border border-teal-300 rounded-t-lg overflow-hidden">
          {dayLabels.map(label => (
            <div key={label} className="bg-teal-100 text-teal-800 text-sm sm:text-base font-bold text-center py-3 border-r border-teal-200 last:border-r-0">{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-teal-300 border-x border-b border-teal-300 rounded-b-lg overflow-hidden">
          {calendarDays}
        </div>
      </main>

      {isModalOpen && selectedDate && (
        <CalendarModal
          date={selectedDate}
          declaration={declarations[selectedDate - 1]}
          currentCount={dateStatuses[selectedDate.toString()]?.count || 0}
          isCompleted={dateStatuses[selectedDate.toString()]?.completed || false}
          onClose={handleCloseModal}
          onDeclare={handleDeclare}
        />
      )}
      {isChallengeComplete && (
        <FinalCompletionModal userName={userInfo?.name} onClose={() => setIsChallengeComplete(false)} />
      )}
        
      <button onClick={toggleMusic} className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-3 shadow-lg z-50 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400" aria-label={isMusicPlaying ? "음악 끄기" : "음악 켜기"}>
        {isMusicPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        )}
      </button>

      <footer className="mt-8 sm:mt-10 text-center">
        <p className="text-xs sm:text-sm text-slate-600 opacity-75">매일의 정체성 선포를 통해 믿음의 용사로 굳건히 서세요!</p>
      </footer>
    </div>
  );
}

export default App;


