import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
    }
  });
  return filelist;
};

const files = walkSync('./src/components').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <div className="text-center">Text</div> with Text
  content = content.replace(/<div className="text-center">([^<]+)<\/div>/g, '$1');

  if (file.includes('Signup.tsx')) {
    content = content.replace(
      /className="flex-1 px-4 py-3 rounded-xl bg-white\/10 border border-white\/30 text-white placeholder-white\/50 focus:outline-none focus:border-yellow-400"/g,
      'className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"'
    );
    content = content.replace(
      /className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-white\/30 text-white focus:outline-none focus:border-yellow-400 appearance-none"/g,
      'className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-800 border border-white/30 text-white focus:outline-none focus:border-yellow-400 appearance-none"'
    );
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Done");
