// Music Tray cards for the next project. Completed projects have their own archived cards.
// Song 2 is run by one agent on a timer: see autopilot/PLAN.md. TRAY_PLAN is the checklist.
window.TRAY_PLAN = [
  { step: 1,  time: "3:30 PM", title: "Musical style", kind: "choice", status: "planned" },
  { step: 2,  time: "3:45 PM", title: "Lyrics: hook, chorus & refrain", kind: "choice", status: "planned" },
  { step: 3,  time: "4:00 PM", title: "Artistic world", kind: "choice", status: "planned" },
  { step: 4,  time: "4:15 PM", title: "Recording (Suno, two takes)", kind: "choice", status: "planned" },
  { step: 5,  time: "4:30 PM", title: "Song analysis, played back", kind: "notice", status: "planned" },
  { step: 6,  time: "4:45 PM", title: "Storyboard", kind: "choice", status: "planned" },
  { step: 7,  time: "5:00 PM", title: "Visual instrument", kind: "choice", status: "planned" },
  { step: 8,  time: "5:15 PM", title: "Plates (scene stills)", kind: "notice", status: "planned" },
  { step: 9,  time: "5:30 PM", title: "Cue-led cut", kind: "notice", status: "planned" },
  { step: 10, time: "5:45 PM", title: "Self-critique & fixes", kind: "notice", status: "planned" },
  { step: 11, time: "6:00 PM", title: "Pre-render cut · ready to render", kind: "notice", status: "planned" }
];
window.TRAY_CARDS = [];
