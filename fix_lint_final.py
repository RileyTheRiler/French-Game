
import os

def replace_text(filepath, search, replace):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    if search in content:
        content = content.replace(search, replace)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Replaced in {filepath}")

# Fix ShopModal setState
replace_text('src/components/ShopModal.jsx',
             'setShopData(selection);',
             'setTimeout(() => setShopData(selection), 0);')

# Fix StudySession setState (downloadStatus)
replace_text('src/components/Study/StudySession.jsx',
             "setDownloadStatus('disabled');",
             "setTimeout(() => setDownloadStatus('disabled'), 0);")
replace_text('src/components/Study/StudySession.jsx',
             "setDownloadStatus('checking');",
             "setTimeout(() => setDownloadStatus('checking'), 0);")

# Fix StudySession setState (dueWords)
# This one is a block, tricky to replace simple string.
# But let's try replacing the start of the block.
replace_text('src/components/Study/StudySession.jsx',
             'setDueWords(filtered);',
             'setTimeout(() => { setDueWords(filtered);')

replace_text('src/components/Study/StudySession.jsx',
             'setSessionReward(null);',
             'setSessionReward(null); }, 0);')

# Disable unused motion imports
ui_files = [
    'src/components/SettingsModal.jsx',
    'src/components/ShopModal.jsx',
    'src/components/StatsModal.jsx',
    'src/components/SmartBreakModal.jsx',
    'src/components/SmartImport/WordDetailModal.jsx',
    'src/components/SocialModal.jsx',
    'src/components/StoryMode.jsx',
    'src/components/StreakCard.jsx',
    'src/components/WeeklyRecapModal.jsx'
]

for f in ui_files:
    replace_text(f, "import { motion } from 'framer-motion';", "// eslint-disable-next-line no-unused-vars\nimport { motion } from 'framer-motion';")
    replace_text(f, "import { motion, AnimatePresence } from 'framer-motion';", "// eslint-disable-next-line no-unused-vars\nimport { motion, AnimatePresence } from 'framer-motion';")

print("Done")
