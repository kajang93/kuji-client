const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { PullToRefresh } from './components/PullToRefresh';")) {
  content = content.replace(
    'import { LiveTicker } from "./components/LiveTicker";',
    'import { LiveTicker } from "./components/LiveTicker";\nimport { PullToRefresh } from "./components/PullToRefresh";'
  );
}

const refreshLogic = `  const handleRefresh = async () => {
    await handleFetchBoards();
    if (user?.role === 'ADMIN' || user?.role === 'SELLER') {
      try {
        const boards = await fetchSellerKujiBoards();
        const mappedCollections = boards.map((board: any) => {
          return {
            id: board.id.toString(),
            name: board.title,
            image: board.images?.find((img: any) => img.imageType === 'THUMBNAIL')?.imageUrl || board.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
            totalKuji: board.totalCount || 0,
            remainingKuji: board.remainCount || 0,
            gradeCount: board.gradeCount || 0,
            boardId: board.id,
            isWished: board.isWished,
            operationStatus: board.status === 'ACTIVE' ? 'active' : board.status === 'PREPARING' ? 'scheduled' : 'ended',
            pricePerDraw: board.pricePerDraw || 15000,
            prizes: []
          };
        });
        setSellerCollections(mappedCollections);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {`;

if (!content.includes('const handleRefresh = async () => {')) {
  content = content.replace('  useEffect(() => {\n    handleFetchBoards();\n  }, []);', refreshLogic + '\n    handleFetchBoards();\n  }, []);');
}

const mainScrollStart = `<div\n        className="flex-1 overflow-y-auto overflow-x-hidden relative w-full"\n        id="main-scroll-container"\n      >`;
const wrapperStart = `<div\n        className="flex-1 overflow-y-auto overflow-x-hidden relative w-full"\n        id="main-scroll-container"\n      >\n        <PullToRefresh onRefresh={handleRefresh}>`;
const wrapperEndStr = `        {isSidebarOpen && (\n          <Sidebar`;

if (!content.includes('<PullToRefresh onRefresh={handleRefresh}>')) {
  content = content.replace(mainScrollStart, wrapperStart);
  content = content.replace(wrapperEndStr, `        </PullToRefresh>\n` + wrapperEndStr);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched for PullToRefresh');
