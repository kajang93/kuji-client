import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if "extractErrorMessage" not in content:
        content = content.replace("import { API_HOST, getHeaders", "import { API_HOST, getHeaders, extractErrorMessage")
        content = content.replace("import { API_HOST, getHeaders }", "import { API_HOST, getHeaders, extractErrorMessage }")
        
        # if the above didn't work because getHeaders isn't imported like that
        if "extractErrorMessage" not in content:
            if "import { getHeaders, API_HOST }" in content:
                content = content.replace("import { getHeaders, API_HOST }", "import { getHeaders, API_HOST, extractErrorMessage }")

    # Replace response.text() patterns
    # Pattern 1:
    # const errorText = await response.text();
    # throw new Error(errorText || "...");
    content = re.sub(
        r'const (\w+) = await response\.text\(\);\s*throw new Error\(\1 \|\| ("[^"]+"|`[^`]+`|\'[^\']+\')\);',
        r'const \1 = await response.text();\n    throw new Error(extractErrorMessage(\1, \2));',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/api/auth.ts')
fix_file('src/api/shipping.ts')
