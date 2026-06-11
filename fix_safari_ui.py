import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace <div className="text-center">text</div> inside buttons with just the text or span
    # Actually, we can just replace <div className="text-center"> with <span className="w-full text-center"> and </div> with </span>
    # But wait, it's safer to add flex items-center justify-center to the button itself if it doesn't have it, and remove the div.
    # Let's just use regex to remove the <div className="text-center"> and </div> wrapper around text.
    # Regex: <div className="text-center">\s*(.*?)\s*</div>
    # But ONLY if it's inside a button. It's easier to just replace all `<div className="text-center">` that contain simple text with simple text if they are button labels.
    
    # Let's find all <div className="text-center">...</div> and replace with just the content if the content has no tags.
    content = re.sub(r'<div className="text-center">([^<]+)</div>', r'\1', content)

    # For the email input min-w-0 fix in Signup.tsx
    if "Signup.tsx" in filepath:
        content = content.replace(
            'className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"',
            'className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"'
        )
        content = content.replace(
            'className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-white/30 text-white focus:outline-none focus:border-yellow-400 appearance-none"',
            'className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-800 border border-white/30 text-white focus:outline-none focus:border-yellow-400 appearance-none"'
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

