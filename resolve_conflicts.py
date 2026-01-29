import os
import re

def resolve_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Pattern: <<<<<<< HEAD ... ======= ... >>>>>>> ...
        # We use re.DOTALL to match newlines
        # We want to keep Group 1
        pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n.*?\n>>>>>>> [^\n]*', re.DOTALL)

        # Check if file has markers
        if not '<<<<<<< HEAD' in content:
            print(f"No HEAD markers in {filepath}")
            return

        new_content = pattern.sub(r'\1', content)

        # Check if any markers left (e.g. non-HEAD markers)
        if '<<<<<<<' in new_content:
            print(f"Warning: Residual markers in {filepath}")

        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Resolved {filepath}")

    except Exception as e:
        print(f"Error resolving {filepath}: {e}")

def main():
    files = [
        'src/components/FallingWords/FallingWordsGame.jsx',
        'src/components/ShopModal.jsx',
        'src/components/StatsModal.jsx',
        'src/components/GrammarDrill.jsx',
        'src/components/ConversationSimulator.jsx',
        'src/components/LeaderboardModal.jsx',
        'src/components/PronunciationCoach.jsx',
        'src/data/grammar.js',
        'src/components/FallingWords/WordItem.jsx'
    ]

    for f in files:
        if os.path.exists(f):
            resolve_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
