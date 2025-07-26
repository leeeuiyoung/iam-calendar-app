import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Netlify 빌드 오류를 해결하기 위해, Canvas 환경 변수를 인식하도록 주석을 추가하고
// 외부 환경을 위한 실제 Firebase 구성 값을 포함합니다.
// eslint-disable-next-line no-undef
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config)
  : {
    apiKey: "AIzaSyCCGbZc4zEDgbaEhEWpg1rzCHKLQeKHthQ",
    authDomain: "iam-calendar-179e8.firebaseapp.com",
    projectId: "iam-calendar-179e8",
    storageBucket: "iam-calendar-179e8.firebasestorage.app",
    messagingSenderId: "1005875650817",
    appId: "1:1005875650817:web:d6cf5eb571af10d2053b00"
  };

// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mens-ministry-challenge-react-august';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 남선교회 8월 챌린지용 정체성 선포 (31일)
const declarations = [
  "나는 하나님의 사랑받는 자녀입니다", // 1
  "나는 하나님의 형상입니다", // 2
  "나는 하늘나라 상속자입니다", // 3
  "나는 하늘나라 시민권자입니다", // 4
  "나는 하나님께 시선을 두는 자녀입니다", // 5
  "나는 그리스도의 심판대에서 생각합니다", // 6
  "나는 하나님 보시기에 심히 좋은 존재입니다", // 7
  "나는 예수님만큼 가치 있는 존재입니다", // 8
  "나는 주안에서 기뻐하는 자입니다", // 9
  "나는 새사람의 정체성으로 살아갑니다", // 10
  "나는 감사로 문을 열어갑니다", // 11
  "나는 이기며 승리하는 권세가 있습니다", // 12
  "나는 말과 혀로 가정을 살리는 자입니다", // 13
  "나는 그리스도와 연합된 존재입니다", // 14
  "나는 삶을 인도하시는 하나님을 신뢰합니다", // 15
  "나는 영혼이 잘됨 같이 범사도 잘됩니다", // 16
  "나는 믿음을 선포하는 자입니다", // 17
  "나는 감사로 상황을 돌파합니다", // 18
  "나는 어떤 상황에서도 하나님을 찬양합니다", // 19
  "나는 누구보다 존귀한 자녀입니다", // 20
  "나는 예수님과 함께 걸어갑니다", // 21
  "나는 어둠을 몰아내는 빛입니다", // 22
  "나는 기도하며 낙심하지 않는 자입니다", // 23
  "나는 빛 가운데 걸어가는 자녀입니다", // 24
  "나는 기도 응답을 풍성히 누립니다", // 25
  "나는 소망 가운데 인내합니다", // 26
  "나는 내 생각보다 크신 하나님의 계획을 신뢰합니다", // 27
  "나는 하나님의 말씀에 삶의 기준을 두는 자녀입니다", // 28
  "나는 하나님의 평강을 누리는 자녀입니다", // 29
  "나는 예수님처럼 용서하는 자녀입니다", // 30
  "나는 가정의 영적 제사장입니다." // 31
];

// 8월 챌린지용 찬양 링크 (31개)
const youtubeLinks = [
  "https://www.youtube.com/watch?v=A_SEQKpeHVw", "https://www.youtube.com/watch?v=hTrpI5sbMS8", "https://www.youtube.com/watch?v=2vbx_4bAoxU", "https://www.youtube.com/watch?v=PkZKUp4DfXw", "https://www.youtube.com/watch?v=HPJoDDr2YHA", "https://www.youtube.com/watch?v=xC53ITAoP0w", "https://www.youtube.com/watch?v=QNuN6618rS4", "https://www.youtube.com/watch?v=dQjt5Qdt22E", "https://www.youtube.com/watch?v=q4KeLEWTE0A", "https://www.youtube.com/watch?v=A_SEQKpeHVw", "https://www.youtube.com/watch?v=hwz1DIE7ofg", "https://www.youtube.com/watch?v=zb62W-xoUts", "https://www.youtube.com/watch?v=Z3juMkdp3ME", "https://www.youtube.com/watch?v=roh3jsvkTZ0", "https://www.youtube.com/watch?v=ZUOCGUOOO8g", "https://www.youtube.com/watch?v=T2QoSHfcxmQ", "https://www.youtube.com/watch?v=Qek0xGCTCIc", "https://www.youtube.com/watch?v=eMWCKZjztZ0", "https://www.youtube.com/watch?v=VyijUK5HzVU", "https://www.youtube.com/watch?v=evFTNQOrL3w", "https://www.youtube.com/watch?v=GU6VfynUTuA", "https://www.youtube.com/watch?v=QmKXA-mtkTI", "https://www.youtube.com/watch?v=KS4wNLfGD1s", "https://www.youtube.com/watch?v=_dRlrTHN6Ug", "https://www.youtube.com/watch?v=iHiZiEAm2FA", "https://www.youtube.com/watch?v=QNjJfNJrHF0", "https://www.youtube.com/watch?v=tl-ZLufM4gM", "https://www.youtube.com/watch?v=xd_UvkIKwmw", "https://www.youtube.com/watch?v=Yrgq59I205c", "https://www.youtube.com/watch?v=PiFvD8tyvMk",
  "https://www.youtube.com/watch?v=VIgs8BoMnHk"
];

const MAX_DECLARATION_COUNT = 3;
const challengeYear = 2025;
const challengeMonth = 7; // 0-indexed, 7은 8월
const USERNAME_STORAGE_KEY = 'mensMinistryChallengeUserNameReact';

const YouTubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors">
    <path fillRule="evenodd" d="M19.802 5.802a2.418 2.418 0 00-1.708-1.708C16.602 3.75 12 3.75 12 3.75s-4.602 0-6.094.344a2.418 2.418 0 00-1.708 1.708C3.75 7.294 3.75 12 3.75 12s0 4.706.344 6.198a2.418 2.418 0 001.708 1.708C7.398 20.25 12 20.25 12 20.25s4.602 0 6.094-.344a2.418 2.418 0 001.708-1.708C20.25 16.706 20.25 12 20.25 12s0-4.706-.448-6.198zM9.75 15.75V8.25l6 3.75-6 3.75z" clipRule="evenodd" />
  </svg>
);

const getInitialDateStatus = () => {
    const status = {};
    for (let i = 1; i <= declarations.length; i++) {
        status[i.toString()] = { count: 0, completed: false, youtubeViewed: false };
    }
    return status;
};

function CalendarModal({ date, declaration, onClose, onDeclare, currentCount, isCompleted }) {
  const handleDeclareClick = () => {
    if (!isCompleted) {
      onDeclare();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">{`${challengeYear}년 ${challengeMonth + 1}월 ${date}일`}</h3>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">"{declaration}"</p>
        <div className="flex flex-col items-center">
          <button
            onClick={handleDeclareClick}
            disabled={isCompleted}
            className={`px-6 py-3 mb-4 text-white font-semibold rounded-md focus:outline-none transition-colors ${isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isCompleted ? `선포 완료!` : `정체성 선포하기 (${currentCount}/${MAX_DECLARATION_COUNT})`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300 focus:outline-none"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function FinalCompletionModal({ userName, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center transform transition-all scale-100">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">{userName}님 축복합니다.</h3>
        <p className="text-lg text-gray-700 mb-6">새사람의 정체성을 선포하며 계속해서 승리하세요!</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          확인
        </button>
      </div>
    </div>
  );
}


function App() {
  const [currentUserName, setCurrentUserName] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  
  const [userId, setUserId] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dateStatuses, setDateStatuses] = useState(getInitialDateStatus());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedName) {
      setCurrentUserName(storedName);
      setIsAppReady(true);
    } else {
      setIsAppReady(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const hostToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setUserId(user.uid);
      } else if (hostToken) {
        try {
          const userCredential = await signInWithCustomToken(auth, hostToken);
          setUserId(userCredential.user.uid);
        } catch (error) {
          console.error("Custom token sign-in failed, trying anonymous", error);
          try {
            const anonUser = await signInAnonymously(auth);
            setUserId(anonUser.user.uid);
          } catch (anonError) {
            console.error("Anonymous sign-in failed (after token fail):", anonError);
          }
        }
      } else {
        try {
          const anonUser = await signInAnonymously(auth);
          setUserId(anonUser.user.uid);
        } catch (error) {
          console.error("Default anonymous sign-in failed", error);
        }
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (userId && isAppReady) {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/mens_challenge_status`, `august${challengeYear}`);
      const unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
        const initialStatuses = getInitialDateStatus();
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          for (const dayKey in firestoreData) {
            if (initialStatuses.hasOwnProperty(dayKey)) {
              initialStatuses[dayKey] = { ...initialStatuses[dayKey], ...firestoreData[dayKey] };
            }
          }
        }
        setDateStatuses(initialStatuses);
      }, (error) => {
        console.error("Error fetching date statuses:", error);
        setDateStatuses(getInitialDateStatus());
      });
      return () => unsubscribeFirestore();
    } else if (!userId && isAppReady) {
        setDateStatuses(getInitialDateStatus());
    }
  }, [userId, isAppReady]);


  const handleStartChallenge = () => {
    const name = nameInput.trim();
    if (!name) {
      alert("이름 또는 닉네임을 입력해주세요.");
      return;
    }
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
    setCurrentUserName(name);
    setIsAppReady(true); 
  };

  const isDateClickable = useCallback((day) => {
    if (!userId) return false; 
    if (day === 1) return true;
    const prevDayKey = (day - 1).toString();
    const prevDayStatus = dateStatuses[prevDayKey];
    return prevDayStatus && prevDayStatus.completed && prevDayStatus.youtubeViewed;
  }, [dateStatuses, userId]);

  const handleDateClick = (day) => {
    if (!userId) {
        alert("데이터를 불러오는 중이거나 인증에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    if (isDateClickable(day) && day > 0 && day <= declarations.length) {
      setSelectedDate(day);
      setIsModalOpen(true);
    } else if (day > 0 && day <= declarations.length) {
      alert("이전 날짜의 선포와 찬양 듣기를 먼저 완료해주세요!");
    }
  };

  const isValidYoutubeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };
  
  const saveDateStatusToFirestore = async (day, statusUpdate) => {
    if (!userId) return;
    const dayKey = day.toString();
    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/mens_challenge_status`, `august${challengeYear}`);
        await setDoc(docRef, { [dayKey]: statusUpdate }, { merge: true });
    } catch (error) {
        console.error("Error saving date status to Firestore:", error);
        alert("상태 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleYoutubeViewed = async (day) => {
    if (!userId) return;
    const dayKey = day.toString();
    const currentStatus = dateStatuses[dayKey] || getInitialDateStatus()[dayKey];

    if (currentStatus.youtubeViewed) return;

    const newStatus = { ...currentStatus, youtubeViewed: true };
    setDateStatuses(prevStatuses => ({ ...prevStatuses, [dayKey]: newStatus }));
    await saveDateStatusToFirestore(day, newStatus);
    
    // 최종 완료 확인
    if (day === declarations.length && newStatus.completed) {
        setTimeout(() => setIsChallengeComplete(true), 500);
    }
  };

  const handleOpenYoutubeLink = (e, day) => {
    e.stopPropagation();
    if (!userId) {
        alert("데이터를 불러오는 중이거나 인증에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    const link = youtubeLinks[day - 1];
    if (isValidYoutubeUrl(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
      handleYoutubeViewed(day);
    } else {
      alert("해당 날짜의 유튜브 링크가 올바르지 않거나 아직 설정되지 않았습니다.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleDeclare = async () => {
    if (!selectedDate || !userId) return;
    const dayKey = selectedDate.toString();
    const currentStatus = dateStatuses[dayKey] || getInitialDateStatus()[dayKey];

    if (currentStatus.completed) return;

    const newCount = currentStatus.count + 1;
    const newCompleted = newCount >= MAX_DECLARATION_COUNT;
    const newStatus = { ...currentStatus, count: newCount, completed: newCompleted };

    setDateStatuses(prevStatuses => ({ ...prevStatuses, [dayKey]: newStatus, }));
    await saveDateStatusToFirestore(selectedDate, newStatus);

    // 최종 완료 확인
    if (selectedDate === declarations.length && newCompleted && newStatus.youtubeViewed) {
        setTimeout(() => setIsChallengeComplete(true), 500);
    }

    if (newCompleted) {
      setTimeout(handleCloseModal, 300);
    }
  };

  const daysInAugust2025 = 31;
  const firstDayOfMonth = new Date(challengeYear, challengeMonth, 1).getDay(); // 2025년 8월 1일은 금요일(5)
  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="border p-1 h-24 sm:h-28"></div>);
  }
  
  for (let day = 1; day <= daysInAugust2025; day++) {
    const dayKey = day.toString();
    const status = dateStatuses[dayKey] || { count: 0, completed: false, youtubeViewed: false };
    const isDeclarationDone = status.completed;
    const isYoutubeDone = status.youtubeViewed;
    const isDayFullyCompleted = isDeclarationDone && isYoutubeDone;

    const today = new Date();
    const isToday = today.getFullYear() === challengeYear && today.getMonth() === challengeMonth && today.getDate() === day;
    const youtubeLinkExists = isValidYoutubeUrl(youtubeLinks[day-1]);
    const clickable = isDateClickable(day);

    calendarDays.push(
      <div
        key={day}
        className={`border p-1 h-24 sm:h-28 flex flex-col items-center justify-around 
                    ${isDayFullyCompleted ? 'bg-blue-200 font-semibold' : 'bg-white'} 
                    ${isToday && !isDayFullyCompleted ? 'ring-2 ring-blue-500' : ''}
                    ${clickable ? 'cursor-pointer hover:bg-blue-100' : 'cursor-not-allowed opacity-60 bg-gray-100'}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="text-sm sm:text-base font-medium">{day}</span>
        <div className="text-xs text-blue-700 font-semibold leading-tight my-0.5 text-center">정체성 선포!</div> 
        {youtubeLinkExists ? (
            <button 
                onClick={(e) => clickable ? handleOpenYoutubeLink(e, day) : e.stopPropagation()}
                disabled={!clickable}
                className={`p-1 rounded-full inline-flex items-center justify-center group ${clickable ? 'hover:bg-red-100' : 'cursor-not-allowed'}`}
                aria-label={`${day}일차 찬양 듣기`}
            > <YouTubeIcon /> </button>
        ) : ( <div className="h-7"></div> )}
        <div className="flex items-center justify-center space-x-1.5 h-2">
            {isDeclarationDone ? 
                <div className="w-2 h-2 bg-green-500 rounded-full" title="선포 완료"></div> : 
                <div className="w-2 h-2 bg-gray-300 rounded-full" title="선포 미완료"></div>
            }
            {isYoutubeDone ? 
                <div className="w-2 h-2 bg-red-500 rounded-full" title="찬양 완료"></div> : 
                <div className="w-2 h-2 bg-gray-300 rounded-full" title="찬양 미완료"></div>
            }
        </div>
      </div>
    );
  }
  
  const totalCellsToDisplay = 42; // 6주 * 7일 = 42칸, 8월 달력 표시에 충분
  while(calendarDays.length < totalCellsToDisplay) {
      calendarDays.push(<div key={`empty-end-${calendarDays.length}`} className="border p-1 h-24 sm:h-28"></div>);
  }
  const dayLabels = ['주일', '월', '화', '수', '목', '금', '토'];

  if (isAuthLoading && !currentUserName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-xl p-4 font-['Nunito',_sans-serif]">
        <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>남선교회 챌린지 앱을 준비 중입니다...</p>
      </div>
    );
  }
  
  if (!isAppReady) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-500 to-indigo-600 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
                <div className="bg-white bg-opacity-95 p-8 sm:p-10 rounded-3xl shadow-xl text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2 whitespace-nowrap">8월 정체성 선포 챌린지</h1>
                    <p className="text-gray-600 mb-6">화양교회 남선교회</p>
                    <input 
                        type="text" 
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStartChallenge()}
                        placeholder="이름 또는 닉네임을 입력하세요" 
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" />
                    <button 
                        onClick={handleStartChallenge}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold py-3 px-4 rounded-lg text-lg transition-colors">
                        챌린지 시작하기!
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-indigo-600 flex flex-col items-center p-4 sm:p-6 font-['Nunito',_sans-serif]">
      <header className="text-center my-6 sm:my-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-md whitespace-nowrap">8월 정체성 선포 챌린지</h1>
        <div className="inline-block mt-2 bg-black bg-opacity-20 px-3 py-1 rounded-md">
            <p id="headerUserText" className="text-lg sm:text-xl text-white opacity-90">
                화양교회 남선교회 {currentUserName && `(${currentUserName}님)`}
            </p>
        </div>
        <p className="text-md sm:text-lg text-yellow-300 font-semibold mt-3">
          2025년 8월 한 달 동안 매일 세 번씩 선포 & 찬양 듣기
        </p>
      </header>

      <main className="bg-white bg-opacity-95 p-4 sm:p-6 rounded-3xl shadow-xl w-full max-w-2xl lg:max-w-3xl">
        <div id="calendar-header" className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {dayLabels.map(label => (
            <div key={label} className="bg-blue-600 text-white text-xs sm:text-sm font-semibold text-center py-2 sm:py-3">
              {label}
            </div>
          ))}
        </div>
        <div id="calendar-grid" className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
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
        <FinalCompletionModal 
            userName={currentUserName}
            onClose={() => setIsChallengeComplete(false)} 
        />
      )}

      <footer className="mt-8 sm:mt-10 text-center">
        <p className="text-xs sm:text-sm text-white opacity-75">
          매일의 정체성 선포를 통해 믿음의 용사로 굳건히 서세요!
        </p>
      </footer>
    </div>
  );
}

export default App;
