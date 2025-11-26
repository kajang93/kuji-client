import { useState } from 'react';
import MainScreen from './components/MainScreen';
import AnimeList from './components/AnimeList';
import PrizeDetail from './components/PrizeDetail';
import KujiSelection from './components/KujiSelection';
import KujiReveal from './components/KujiReveal';

export type Prize = {
  id: string;
  rank: string;
  name: string;
  image: string;
  totalCount: number;
  remainingCount: number;
  opened: boolean[];
};

export type AnimeCollection = {
  id: string;
  name: string;
  image: string;
  totalKuji: number;
  remainingKuji: number;
  prizes: Prize[];
};

export default function App() {
  const [screen, setScreen] = useState<'main' | 'list' | 'detail' | 'selection' | 'reveal'>('main');
  const [selectedAnime, setSelectedAnime] = useState<AnimeCollection | null>(null);
  const [selectedKuji, setSelectedKuji] = useState<number[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<Prize[]>([]);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [kujiStatus, setKujiStatus] = useState<boolean[]>([]);

  const animeCollections: AnimeCollection[] = [
    {
      id: '1',
      name: '원피스',
      image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400',
      totalKuji: 80,
      remainingKuji: 80,
      prizes: [
        { id: 'A', rank: 'A', name: 'A상 피규어', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 2, remainingCount: 2, opened: [false, false] },
        { id: 'B', rank: 'B', name: 'B상 피규어', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 3, remainingCount: 3, opened: [false, false, false] },
        { id: 'C', rank: 'C', name: 'C상 피규어', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 2, remainingCount: 2, opened: [false, false] },
        { id: 'D', rank: 'D', name: 'D상 피규어', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 3, remainingCount: 3, opened: [false, false, false] },
        { id: 'E', rank: 'E', name: 'E상 피규어', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 1, remainingCount: 1, opened: [false] },
        { id: 'F', rank: 'F', name: 'F상 머그', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 1, remainingCount: 1, opened: [false] },
        { id: 'G', rank: 'G', name: 'G상 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 24, remainingCount: 24, opened: new Array(24).fill(false) },
        { id: 'H', rank: 'H', name: 'H상 코드밴드/코스터', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200', totalCount: 21, remainingCount: 21, opened: new Array(21).fill(false) },
      ]
    },
    {
      id: '2',
      name: '귀멸의 칼날',
      image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=400',
      totalKuji: 80,
      remainingKuji: 80,
      prizes: [
        { id: 'A', rank: 'A', name: 'A상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 2, remainingCount: 2, opened: [false, false] },
        { id: 'B', rank: 'B', name: 'B상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 3, remainingCount: 3, opened: [false, false, false] },
        { id: 'C', rank: 'C', name: 'C상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 2, remainingCount: 2, opened: [false, false] },
        { id: 'D', rank: 'D', name: 'D상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 3, remainingCount: 3, opened: [false, false, false] },
        { id: 'E', rank: 'E', name: 'E상 타월', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 5, remainingCount: 5, opened: new Array(5).fill(false) },
        { id: 'F', rank: 'F', name: 'F상 파우치', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 8, remainingCount: 8, opened: new Array(8).fill(false) },
        { id: 'G', rank: 'G', name: 'G상 키링', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 30, remainingCount: 30, opened: new Array(30).fill(false) },
      ]
    },
    {
      id: '3',
      name: '나루토',
      image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=400',
      totalKuji: 80,
      remainingKuji: 80,
      prizes: [
        { id: 'A', rank: 'A', name: 'A상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 1, remainingCount: 1, opened: [false] },
        { id: 'B', rank: 'B', name: 'B상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 2, remainingCount: 2, opened: [false, false] },
        { id: 'C', rank: 'C', name: 'C상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 3, remainingCount: 3, opened: [false, false, false] },
        { id: 'D', rank: 'D', name: 'D상 피규어', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 4, remainingCount: 4, opened: [false, false, false, false] },
        { id: 'E', rank: 'E', name: 'E상 플레이트', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 10, remainingCount: 10, opened: new Array(10).fill(false) },
        { id: 'F', rank: 'F', name: 'F상 스티커', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 25, remainingCount: 25, opened: new Array(25).fill(false) },
        { id: 'G', rank: 'G', name: 'G상 배지', image: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200', totalCount: 35, remainingCount: 35, opened: new Array(35).fill(false) },
      ]
    }
  ];

  const handleAnimeSelect = (anime: AnimeCollection) => {
    setSelectedAnime(anime);
    setScreen('detail');
    // Initialize kuji status - 15% already opened
    const status = Array.from({ length: anime.totalKuji }, () => Math.random() < 0.15);
    setKujiStatus(status);
  };

  const handlePurchase = (count: number) => {
    setPurchaseCount(count);
    setSelectedKuji([]);
    setScreen('selection');
  };

  const handleKujiReveal = (kujiIndices: number[]) => {
    // Simulate random prizes for each selected kuji
    if (selectedAnime) {
      const prizes = kujiIndices.map(() => {
        return selectedAnime.prizes[Math.floor(Math.random() * selectedAnime.prizes.length)];
      });
      setRevealedPrizes(prizes);
      setSelectedKuji(kujiIndices);
      setScreen('reveal');
    }
  };

  const handleRevealComplete = () => {
    setScreen('main');
    setSelectedAnime(null);
    setRevealedPrizes([]);
    setSelectedKuji([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800">
      {screen === 'main' && (
        <MainScreen onStart={() => setScreen('list')} />
      )}
      {screen === 'list' && (
        <AnimeList 
          collections={animeCollections} 
          onSelect={handleAnimeSelect}
          onBack={() => setScreen('main')}
        />
      )}
      {screen === 'detail' && selectedAnime && (
        <PrizeDetail 
          anime={selectedAnime}
          onBack={() => setScreen('list')}
          onPurchase={handlePurchase}
        />
      )}
      {screen === 'selection' && selectedAnime && (
        <KujiSelection
          totalKuji={selectedAnime.totalKuji}
          purchaseCount={purchaseCount}
          kujiStatus={kujiStatus}
          onConfirm={handleKujiReveal}
          onBack={() => setScreen('detail')}
        />
      )}
      {screen === 'reveal' && revealedPrizes.length > 0 && (
        <KujiReveal 
          prizes={revealedPrizes}
          onComplete={handleRevealComplete}
        />
      )}
    </div>
  );
}
