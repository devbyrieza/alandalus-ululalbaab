import os
import re
from glob import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Hero Banners / Page Headers
    content = re.sub(r'from-primary-(\d+)', r'from-blue-\1', content)
    content = re.sub(r'to-primary-(\d+)', r'to-blue-\1', content)
    content = re.sub(r'via-primary-(\d+)', r'via-blue-\1', content)

    # 2. Primary Action Buttons & Colors
    content = re.sub(r'bg-primary-(600|700|800|900|950)', r'bg-blue-\1', content)
    content = re.sub(r'hover:bg-primary-(600|700|800|900|950)', r'hover:bg-blue-\1', content)
    content = re.sub(r'focus:ring-primary-(\d+)', r'focus:ring-blue-\1', content)
    content = re.sub(r'border-primary-(600|700|800|900|950)', r'border-blue-\1', content)
    content = re.sub(r'hover:border-primary-(600|700|800|900|950)', r'hover:border-blue-\1', content)
    content = re.sub(r'text-primary-(800|900|950)', r'text-blue-\1', content)
    content = re.sub(r'shadow-primary', r'shadow-blue', content)

    # 3. Yellow/Gold Accents (Replace secondary with amber where it makes sense as accent)
    content = re.sub(r'text-secondary-(400|500)', r'text-amber-\1', content)
    content = re.sub(r'bg-secondary-(400|500)', r'bg-amber-\1', content)
    
    # 4. LocalStorage Autosave for Forms
    # Basic injection if commented out
    if '// localStorage.setItem' in content:
        content = content.replace('// localStorage.setItem', 'localStorage.setItem')
        content = content.replace('// sessionStorage.setItem', 'sessionStorage.setItem')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    base_dir = r"c:\Users\itpua\Dev\Work\al-andalus\alandalus-ululalbaab\src\app"
    pattern = os.path.join(base_dir, "**", "page.tsx")
    files = glob(pattern, recursive=True)
    
    for f in files:
        process_file(f)

if __name__ == "__main__":
    main()
