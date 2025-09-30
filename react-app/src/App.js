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
  "나는 영적 나실인입니다!", "나는 하나님이 기뻐하시고 사랑하시는 자녀입니다!", "예수님의 온유와 겸손이 내 안에 있습니다!", "나는 하나님의 지혜로 충만합니다!", "유혹과 시험을 이겨낼 힘이 내 안에 있습니다!", "주님은 원수의 목전에서도 상을 베풀어 주십니다!", "나는 하나님 보시기에 심히 좋은 존재입니다!", "나는 하나님의 큰 그림을 믿습니다!", "세상을 이기신 주님이 내 안에 계십니다!", "나는 새사람의 정체성으로 살아갑니다!", "하나님은 든든한 내 아버지이십니다!", "나는 복된 자리에만 거하겠습니다!", "실패해도 주님을 여전히 나를 사랑하십니다!", "나는 하나님 중심으로 살아갑니다!", "급진적인 겸손이 내안에 있습니다!", "나는 약함속에서도 다시 일어섭니다!", "주님은 가장 좋은 것으로 채워주십니다!", "나는 하늘나라의 상속자입니다!", "주님은 우리 가정을 부요케 하십니다!", "나는 이미 천국열쇠를 가졌습니다!", "나는 주와 한영입니다!", "나는 어둠을 몰아내는 빛입니다", "나는 기도하고 낙심하지 않습니다!", "나는 빛 가운데 걸어가는 자녀입니다!", "내 삶의 구석마다 주님의 손길이 머물고 있습니다!", "나는 선한 영향력을 나타내는 소금입니다!", "나는 빛의 갑옷을 입었습니다!", "예수님의 권세가 나의 권세입니다!", "나는 풍성한 결실을 맺는 좋은 땅입니다!", "나는 축복의 유통자입니다!", "나는 그리스도의 향기입니다!"
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
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  // Reference to the <audio> element
  const audioRef = useRef(null);

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
  
  // Autoplay music when the app is ready
  useEffect(() => {
    if (isAppReady && isAudioLoaded) {
      // Attempt to play music automatically.
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Autoplay started successfully.
          setIsMusicPlaying(true);
        })
        .catch(error => {
          // Autoplay was prevented.
          console.log("Autoplay was prevented by the browser. User must interact to play music.");
          setIsMusicPlaying(false);
        });
      }
    }
  }, [isAppReady, isAudioLoaded]);

  // Background Music Logic
  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(error => {
        console.error("Audio play failed:", error);
        alert("브라우저 설정에 의해 자동 재생이 차단되었을 수 있습니다. 페이지와 상호작용 후 다시 시도해주세요.");
        setIsMusicPlaying(false);
      });
    }
  }, [isMusicPlaying]);

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

    const today = new Date();
    if (today.getFullYear() < challengeYear || (today.getFullYear() === challengeYear && today.getMonth() < challengeMonth)) {
        return false;
    }

    const currentDayOfMonth = (today.getFullYear() === challengeYear && today.getMonth() === challengeMonth) 
      ? today.getDate() 
      : 31;

    if (day > currentDayOfMonth) {
        return false;
    }

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
             const today = new Date();
             const isChallengeMonth = today.getFullYear() === challengeYear && today.getMonth() === challengeMonth;
             const currentDayOfMonth = isChallengeMonth ? today.getDate() : 31;
             if (day > currentDayOfMonth) {
                alert("아직 해당 날짜가 되지 않았습니다.");
             } else {
                alert("이전 날짜의 선포를 먼저 완료해주세요!");
             }
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
        className={`relative border border-teal-200 p-2 h-24 sm:h-28 flex flex-col justify-between transition-all duration-200
          ${isDayFullyCompleted ? 'bg-gradient-to-br from-green-300 to-teal-300 shadow-lg' : 'bg-white bg-opacity-50'}
          ${clickable ? 'cursor-pointer hover:bg-teal-100' : 'cursor-not-allowed opacity-70'}
        `}
      >
        <span className={`text-center w-full text-sm sm:text-base font-bold ${isDayFullyCompleted ? 'text-green-900' : 'text-gray-700'}`}>{day}</span>
        <div className="text-center w-full">
            <div className="text-xs sm:text-sm text-teal-700 font-semibold leading-tight mb-1">
                <span className="hidden sm:inline">정체성 </span>선포
            </div>
            <div className="flex items-center justify-center space-x-1.5 h-4">
              <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
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
            placeholder="셀을 입력하세요 (예: ooo셀)"
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
       {/* Add the audio element here */}
       <audio 
        ref={audioRef} 
        src="https://github.com/leeeuiyoung/music-storage/raw/refs/heads/main/PIANO.mp3" 
        loop 
        onLoadedData={() => setIsAudioLoaded(true)}
      />

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
        
      <button 
        onClick={toggleMusic} 
        disabled={!isAudioLoaded}
        className={`fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-3 shadow-lg z-50 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 ${!isAudioLoaded ? 'opacity-50 cursor-not-allowed' : ''}`} 
        aria-label={isMusicPlaying ? "음악 끄기" : "음악 켜기"}
      >
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

