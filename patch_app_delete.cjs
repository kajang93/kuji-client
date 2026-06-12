const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add deleteKujiBoard to import
if (!content.includes('deleteKujiBoard')) {
  content = content.replace(
    'fetchSellerKujiBoards } from "./api/kuji";',
    'fetchSellerKujiBoards, deleteKujiBoard } from "./api/kuji";'
  );
}

// Add onDelete handler
const searchString = 'onEdit={async (id) => {';
const replacementString = `onDelete={async (id) => {
              if (window.confirm("정말로 이 상품을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
                try {
                  await deleteKujiBoard(Number(id));
                  setSellerCollections(prev => prev.filter(c => c.id !== id));
                  alert("상품이 성공적으로 삭제되었습니다.");
                } catch (e) {
                  console.error(e);
                  alert("상품 삭제에 실패했습니다.");
                }
              }
            }}
            onEdit={async (id) => {`;

if (!content.includes('onDelete={async (id) => {')) {
  content = content.replace(searchString, replacementString);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx delete handler patched');
