const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add fetchSellerKujiBoards import
content = content.replace(
  'import { fetchKujiBoards, fetchKujiBoardDetail, drawKuji, fetchMyDrawHistory } from "./api/kuji";',
  'import { fetchKujiBoards, fetchKujiBoardDetail, drawKuji, fetchMyDrawHistory, fetchSellerKujiBoards } from "./api/kuji";'
);

// 2. Add sellerCollections state
if (!content.includes('const [sellerCollections, setSellerCollections]')) {
  content = content.replace(
    'const [animeCollections, setAnimeCollections] = useState<AnimeCollection[]>([]);',
    'const [animeCollections, setAnimeCollections] = useState<AnimeCollection[]>([]);\n  const [sellerCollections, setSellerCollections] = useState<AnimeCollection[]>([]);'
  );
}

// 3. Add useEffect to fetch seller collections
if (!content.includes('fetchSellerKujiBoards().then(boards => {')) {
  const useEffectCode = `
  useEffect(() => {
    if (screen === "businessProducts") {
      fetchSellerKujiBoards()
        .then(boards => {
          const mappedCollections = boards.map((board: any) => {
            return {
              id: board.id.toString(),
              name: board.title,
              image: (board.images?.find((img: any) => img.imageType === 'THUMBNAIL')?.imageUrl || board.images?.[0]?.imageUrl) || "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
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
        })
        .catch(console.error);
    }
  }, [screen]);
  `;
  content = content.replace(
    'const handleFetchBoards = async () => {',
    useEffectCode + '\n  const handleFetchBoards = async () => {'
  );
}

// 4. Update BusinessProductList usage to use sellerCollections
content = content.replace(
  '<BusinessProductList\n            onBack={() => setScreen("businessDashboard")}\n            onOpenSidebar={() => setIsSidebarOpen(true)}\n            collections={animeCollections}',
  '<BusinessProductList\n            onBack={() => setScreen("businessDashboard")}\n            onOpenSidebar={() => setIsSidebarOpen(true)}\n            collections={sellerCollections}'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched successfully');
