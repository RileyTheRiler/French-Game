import re

with open('src/context/CommunityContext.jsx', 'r') as f:
    content = f.read()

# Extract simulateCorrectionResponse
sim_pattern = r'    // Simulate a native speaker correcting the user\'s writing\n    const simulateCorrectionResponse = useCallback\(\(writingId\) => \{.*?\n    \}, \[\]\);\n'
sim_match = re.search(sim_pattern, content, re.DOTALL)

if not sim_match:
    print("Could not find simulateCorrectionResponse")
    exit(1)

sim_code = sim_match.group(0)

# Extract submitWriting
send_pattern = r'    // Submit a new writing\n    const submitWriting = useCallback\(\(text, promptId\) => \{.*?\n    \}, \[addXP, unlockAchievement, communityStats\.writingsSubmitted\]\);\n'
send_match = re.search(send_pattern, content, re.DOTALL)

if not send_match:
    print("Could not find submitWriting")
    exit(1)

send_code = send_match.group(0)

new_send_code = send_code.replace('], [addXP, unlockAchievement, communityStats.writingsSubmitted]);', '], [addXP, unlockAchievement, communityStats.writingsSubmitted, simulateCorrectionResponse]);')

content = content.replace(sim_code, '')
content = content.replace(send_code, sim_code + '\n' + new_send_code)

# Fix react-refresh linting error too
content = content.replace('export const useCommunity = () => {', '// eslint-disable-next-line react-refresh/only-export-components\nexport const useCommunity = () => {')

with open('src/context/CommunityContext.jsx', 'w') as f:
    f.write(content)
