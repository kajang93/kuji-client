const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const backLogic = `  // Global Swipe Right to Go Back logic
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleGlobalBack = () => {
      switch(screen) {
        case 'list':
        case 'myPage':
        case 'businessProducts':
        case 'businessOrders':
        case 'inquiries':
        case 'businessInquiries':
        case 'community':
          setScreen('main');
          break;
        case 'detail':
          setScreen('list');
          break;
        case 'login':
          setScreen(returnToScreen || 'main');
          break;
        case 'communityWrite':
        case 'communityDetail':
          setScreen('community');
          break;
        case 'pointCharge':
          setScreen('myPage');
          break;
        default:
          break;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);

      // 왼쪽 끝(50px 이내)에서 시작해서 오른쪽으로 70px 이상 스와이프한 경우
      if (startX < 50 && diffX > 70 && diffY < 50) {
        handleGlobalBack();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [screen, returnToScreen]);
`;

if (!content.includes('// Global Swipe Right to Go Back logic')) {
  // Insert right before `return (` of the App component.
  // Wait, there might be multiple returns, let's inject it after useEffect for Foreground FCM
  const targetStr = `    return () => {\n      unsubscribe();\n    };\n  }, []);`;
  content = content.replace(targetStr, targetStr + '\n\n' + backLogic);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('Swipe to back logic added');
} else {
  console.log('Swipe to back logic already exists');
}
