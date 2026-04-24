import os
import glob

def main():
    target_string = '<div class="flex justify-between items-center gap-3 max-w-7xl mx-auto px-4">'
    replacement_string = '<div class="flex justify-between items-center gap-1 sm:gap-3 max-w-7xl mx-auto px-4">'
    
    # Find all html files in the directory and subdirectories
    html_files = glob.glob('**/*.html', recursive=True)
    
    files_modified = 0
    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if target_string in content:
            new_content = content.replace(target_string, replacement_string)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched header in {file_path}")
            files_modified += 1
            
    print(f"\nSuccessfully modified {files_modified} files.")

if __name__ == '__main__':
    main()
