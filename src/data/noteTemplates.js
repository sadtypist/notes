// Note Templates with pre-defined content for different use cases

export const noteTemplates = [
    {
        id: 'blank',
        name: 'Blank Note',
        description: 'Start with a clean slate',
        icon: '📝',
        title: '',
        content: '',
        preview: [
            'Start typing your note...',
        ]
    },
    {
        id: 'canvas',
        name: 'Canvas Note',
        description: 'Sketch and draw your ideas',
        icon: '🎨',
        title: 'New Canvas',
        content: '<div>Use the <b>Sketch</b> button <span style="font-family: monospace;">(🖊️)</span> in the toolbar to add drawings!</div>',
        preview: [
            '🎨 Start Sketching',
            'Use the pen tool',
            'Capture visual ideas'
        ]
    },
    {
        id: 'meeting',
        name: 'Meeting Notes',
        description: 'Capture key points from meetings',
        icon: '📋',
        title: 'Meeting Notes - Project Sync',
        content: `<div><b>📅 Date:</b> ${new Date().toLocaleDateString()}</div>
<div><b>🕐 Time:</b> 10:00 AM - 11:00 AM</div>
<div><br></div>
<div><b>👥 Attendees:</b></div>
<div>• John Smith (Host)</div>
<div>• Sarah Johnson</div>
<div>• Mike Chen</div>
<div><br></div>
<div><b>📌 Agenda:</b></div>
<div>1. Review last week's progress</div>
<div>2. Discuss current blockers</div>
<div>3. Plan next sprint tasks</div>
<div><br></div>
<div><b>📝 Discussion Points:</b></div>
<div>• Backend API is 80% complete</div>
<div>• Need clarification on design specs</div>
<div>• Testing phase starts next week</div>
<div><br></div>
<div><b>✅ Action Items:</b></div>
<div>☐ John: Send updated API docs by Friday</div>
<div>☐ Sarah: Review UI mockups</div>
<div>☐ Mike: Set up testing environment</div>
<div><br></div>
<div><b>📅 Next Meeting:</b> Next Monday at 10:00 AM</div>`,
        preview: [
            '📅 Date: Today',
            '👥 Attendees: John, Sarah, Mike',
            '📌 Agenda: 1. 2. 3.',
            '✅ Action Items',
        ]
    },
    {
        id: 'todo',
        name: 'To-Do List',
        description: 'Track tasks and priorities',
        icon: '✅',
        title: 'To-Do List',
        content: `<div><b>🎯 Today's Priorities</b></div>
<div><br></div>
<div><b>🔴 High Priority:</b></div>
<div>☐ Complete project proposal by 3 PM</div>
<div>☐ Review and respond to urgent emails</div>
<div>☐ Prepare presentation slides</div>
<div><br></div>
<div><b>🟡 Medium Priority:</b></div>
<div>☐ Schedule team meeting for next week</div>
<div>☐ Update project documentation</div>
<div>☐ Follow up with client on feedback</div>
<div><br></div>
<div><b>🟢 Low Priority:</b></div>
<div>☐ Organize desktop files</div>
<div>☐ Read industry newsletter</div>
<div>☐ Plan weekend activities</div>
<div><br></div>
<div><b>📝 Notes:</b></div>
<div>Remember to take breaks between tasks!</div>`,
        preview: [
            "🎯 Today's Priorities",
            '🔴 Complete project proposal',
            '🟡 Schedule team meeting',
            '🟢 Organize files',
        ]
    },
    {
        id: 'journal',
        name: 'Daily Journal',
        description: 'Reflect on your day',
        icon: '📔',
        title: `Journal - ${new Date().toLocaleDateString()}`,
        content: `<div><b>🌅 Morning Thoughts</b></div>
<div>Feeling energized and ready to tackle the day. Had a good night's sleep and looking forward to being productive.</div>
<div><br></div>
<div><b>🙏 Gratitude</b></div>
<div>Three things I'm grateful for today:</div>
<div>1. My supportive family and friends</div>
<div>2. Good health and energy</div>
<div>3. Opportunities to learn and grow</div>
<div><br></div>
<div><b>🎯 Today's Intentions</b></div>
<div>What I want to accomplish:</div>
<div>• Stay focused during deep work sessions</div>
<div>• Practice mindfulness for 10 minutes</div>
<div>• Connect with a friend or colleague</div>
<div><br></div>
<div><b>🌙 Evening Reflection</b></div>
<div>What went well today?</div>
<div>- </div>
<div><br></div>
<div>What could I improve?</div>
<div>- </div>
<div><br></div>
<div><b>💭 Additional Thoughts</b></div>
<div>Use this space for any other reflections, ideas, or notes...</div>`,
        preview: [
            '🌅 Feeling energized today',
            '🙏 Grateful for family',
            '🎯 Stay focused on goals',
            '🌙 Reflect on the day',
        ]
    }
];

// Helper function to get template by ID
export const getTemplateById = (id) => {
    return noteTemplates.find(t => t.id === id) || noteTemplates[0];
};

// Helper to get fresh template content (for dynamic dates)
export const getFreshTemplate = (templateId) => {
    const template = getTemplateById(templateId);

    if (templateId === 'meeting') {
        return {
            ...template,
            content: template.content.replace(
                new Date().toLocaleDateString(),
                new Date().toLocaleDateString()
            )
        };
    }

    if (templateId === 'journal') {
        return {
            ...template,
            title: `Journal - ${new Date().toLocaleDateString()}`
        };
    }

    return template;
};
