const fs = require('fs');
let content = fs.readFileSync('src/components/LessonCreator.jsx', 'utf8');

content = content.replace(
    /<Button variant="ghost" size="icon" onClick={\(\) => deleteLesson\(lesson\.id\)}>/,
    '<Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)} aria-label="Delete lesson">'
);

content = content.replace(
    /<Button variant="secondary" size="icon" onClick={\(\) => {/,
    '<Button variant="secondary" size="icon" aria-label="Edit lesson" onClick={() => {'
);

content = content.replace(
    /<Button variant="primary" size="icon" onClick={\(\) => startStudy\(lesson\)}>/,
    '<Button variant="primary" size="icon" onClick={() => startStudy(lesson)} aria-label="Start lesson">'
);

fs.writeFileSync('src/components/LessonCreator.jsx', content);
