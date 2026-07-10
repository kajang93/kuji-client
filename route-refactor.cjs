const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  'import { useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";\nimport { useNavigate, useLocation } from "react-router-dom";'
);

// 2. Replace screen state declaration
const stateRegex = /const \[screen, setScreen\] = useState<ScreenType>\(\(\) => \{[\s\S]*?return "main";\n  \}\);/;

const newLogic = `
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setInternalScreen] = useState<ScreenType>("main");

  // URL -> State 동기화 (사파리 뒤로가기 스와이프 감지용)
  useEffect(() => {
    const p = location.pathname;
    if (p === "/") setInternalScreen("main");
    else if (p === "/list") setInternalScreen("list");
    else if (p.startsWith("/board/")) setInternalScreen("detail");
    else if (p === "/login") setInternalScreen("login");
    else if (p === "/profile") setInternalScreen("profile");
    else if (p === "/profile/edit") setInternalScreen("profileEdit");
    else if (p === "/history") setInternalScreen("winning");
    else if (p === "/points") setInternalScreen("pointCharge");
    else if (p === "/wishlist") setInternalScreen("wishlist");
    else if (p === "/support") setInternalScreen("support");
    else if (p === "/settings") setInternalScreen("settings");
    else if (p.startsWith("/community/write")) setInternalScreen("communityWrite");
    else if (p.startsWith("/community/")) setInternalScreen("communityDetail");
    else if (p === "/community") setInternalScreen("community");
    else if (p === "/notice") setInternalScreen("notice");
    else if (p === "/events") setInternalScreen("events");
    // 그 외 복잡한 라우트는 기존 상태 유지 (점진적 전환)
  }, [location.pathname]);

  // State -> URL 변경 (기존 setScreen 호출 호환성 유지)
  const setScreen = (s: ScreenType) => {
    if (s === "main") navigate("/");
    else if (s === "list") navigate("/list");
    else if (s === "login") navigate("/login");
    else if (s === "profile") navigate("/profile");
    else if (s === "profileEdit") navigate("/profile/edit");
    else if (s === "winning") navigate("/history");
    else if (s === "wishlist") navigate("/wishlist");
    else if (s === "pointCharge") navigate("/points");
    else if (s === "support") navigate("/support");
    else if (s === "settings") navigate("/settings");
    else if (s === "community") navigate("/community");
    else if (s === "communityWrite") navigate("/community/write");
    else if (s === "notice") navigate("/notice");
    else if (s === "events") navigate("/events");
    else if (s === "detail") navigate(\`/board/\${selectedAnime?.id || 1}\`);
    else {
      // 매핑 안된 라우트는 임시로 내부 상태만 변경 (URL 미변경)
      setInternalScreen(s);
    }
  };
`;

content = content.replace(stateRegex, newLogic);

// 3. Remove sessionStorage setItem for currentScreen
content = content.replace(/sessionStorage\.setItem\("currentScreen", screen\);\n?/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log("Refactored App.tsx");
