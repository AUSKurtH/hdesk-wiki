import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_TOOLS = [
  { id: 'freshservice', name: 'FreshService', url: 'https://freshservice.com', icon: 'Ticket', category: 'Ticketing', description: 'IT Service Management' },
  { id: 'jira', name: 'Jira', url: 'https://www.atlassian.com/software/jira', icon: 'LayoutDashboard', category: 'Ticketing', description: 'Project & Issue Tracking' },
  { id: 'teams', name: 'Microsoft Teams', url: 'https://teams.microsoft.com', icon: 'MessageSquare', category: 'Communication', description: 'Team Chat & Meetings' },
  { id: 'webex', name: 'Cisco Webex', url: 'https://www.webex.com', icon: 'Video', category: 'Communication', description: 'Video Conferencing' },
  { id: 'outlook', name: 'Outlook', url: 'https://outlook.office.com', icon: 'Mail', category: 'Communication', description: 'Email & Calendar' },
  { id: 'teamviewer', name: 'TeamViewer', url: 'https://www.teamviewer.com', icon: 'Monitor', category: 'Remote Tools', description: 'Remote Desktop Access' },
  { id: 'anydesk', name: 'AnyDesk', url: 'https://anydesk.com', icon: 'MonitorDot', category: 'Remote Tools', description: 'Fast Remote Access' },
  { id: 'crowdstrike', name: 'CrowdStrike', url: 'https://www.crowdstrike.com', icon: 'Shield', category: 'Security', description: 'Endpoint Security' },
  { id: 'knowbe4', name: 'KnowBe4', url: 'https://www.knowbe4.com', icon: 'GraduationCap', category: 'Security', description: 'Security Awareness Training' },
  { id: 'azure-ad', name: 'Azure AD / Entra', url: 'https://entra.microsoft.com', icon: 'Users', category: 'Identity', description: 'Identity & Access Management' },
  { id: 'okta', name: 'Okta', url: 'https://www.okta.com', icon: 'KeyRound', category: 'Identity', description: 'Identity Provider' },
  { id: 'grafana', name: 'Grafana', url: 'https://grafana.com', icon: 'Activity', category: 'Monitoring', description: 'Metrics & Dashboards' },
  { id: 'datadog', name: 'Datadog', url: 'https://www.datadoghq.com', icon: 'BarChart2', category: 'Monitoring', description: 'Infrastructure Monitoring' },
]

const DEFAULT_CATEGORIES = ['Ticketing', 'Communication', 'Remote Tools', 'Security', 'Identity', 'Monitoring']

const DEFAULT_DOCS = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    content: `# Getting Started

Welcome to the **Helpdesk Dashboard** — your unified platform for all helpdesk tools and documentation.

## What's Here

- **Dashboard**: Quick-access buttons for all your helpdesk tools, organized by category
- **Docs**: Internal wiki for guides, runbooks, and troubleshooting steps
- **Settings**: Customize tools, categories, and preferences

## Quick Start

1. Click any tool card on the **Dashboard** to open it in a new tab
2. Use the **search bar** to quickly find a tool
3. Browse or edit documentation in the **Docs** section
4. Add custom tools in **Settings**

## Tips

- Toggle **light/dark mode** using the button in the top-right corner
- Drag and drop tools in Settings to reorder them
- Export your configuration as JSON for backup or sharing

---

*Happy helping! 🎧*
`,
    parentId: null,
    type: 'file',
  },
  'tools-folder': {
    id: 'tools-folder',
    title: 'Tools',
    content: null,
    parentId: null,
    type: 'folder',
  },
  'freshservice-guide': {
    id: 'freshservice-guide',
    title: 'FreshService Guide',
    content: `# FreshService Guide

FreshService is our primary IT Service Management (ITSM) platform.

## Accessing FreshService

Go to [freshservice.com](https://freshservice.com) or click the **FreshService** tile on the Dashboard.

## Creating a Ticket

1. Click **+ New Ticket** in the top navigation
2. Fill in:
   - **Requester** — search by name or email
   - **Subject** — brief description of the issue
   - **Description** — detailed information
   - **Priority** — Low / Medium / High / Urgent
   - **Category / Sub-category**
3. Click **Create**

## Ticket Statuses

| Status | Meaning |
|--------|---------|
| Open | Newly created, not yet assigned |
| Pending | Waiting for requester response |
| In Progress | Actively being worked |
| Resolved | Solution provided |
| Closed | Confirmed resolved |

## Escalation Path

- **Tier 1** → General issues, password resets, basic troubleshooting
- **Tier 2** → Complex software/hardware issues
- **Tier 3** → Infrastructure, security, escalations

## SLA Guidelines

- Urgent: Response within **1 hour**, resolve within **4 hours**
- High: Response within **4 hours**, resolve within **1 business day**
- Medium: Response within **1 business day**, resolve within **3 business days**
- Low: Response within **2 business days**, resolve within **1 week**
`,
    parentId: 'tools-folder',
    type: 'file',
  },
  'webex-guide': {
    id: 'webex-guide',
    title: 'Webex Guide',
    content: `# Cisco Webex Guide

Webex is our primary video conferencing and team collaboration platform.

## Getting Started

Download the Webex desktop app or access via [webex.com](https://www.webex.com).

## Starting a Meeting

1. Click **Start a Meeting** for an instant meeting, or
2. Click **Schedule** to set up a future meeting

## Sharing Your Screen

- Press **Share** button (or \`Ctrl+Shift+S\`)
- Choose the window or full screen to share
- Annotate using the toolbar that appears

## Common Issues

### Can't hear audio
- Check that the correct audio device is selected (Audio Settings)
- Ensure microphone permissions are granted to Webex

### Poor video quality
- Check internet connection speed
- Lower video resolution in Settings > Video

### Can't join a meeting
- Ensure you have the meeting link or meeting number
- Try joining via browser if the app has issues

## Keyboard Shortcuts

| Action | Windows | Mac |
|--------|---------|-----|
| Mute/Unmute | \`Ctrl+M\` | \`Cmd+M\` |
| Start/Stop Video | \`Ctrl+Shift+V\` | \`Cmd+Shift+V\` |
| Share Screen | \`Ctrl+Shift+S\` | \`Cmd+Shift+S\` |
| Raise Hand | \`Ctrl+Shift+K\` | \`Cmd+Shift+K\` |
`,
    parentId: 'tools-folder',
    type: 'file',
  },
  'troubleshooting-folder': {
    id: 'troubleshooting-folder',
    title: 'Troubleshooting',
    content: null,
    parentId: null,
    type: 'folder',
  },
  'common-issues': {
    id: 'common-issues',
    title: 'Common Issues',
    content: `# Common Issues & Resolutions

A quick reference for the most frequently encountered helpdesk issues.

---

## Password Reset

**Symptoms**: User cannot log in, account locked

**Resolution**:
1. Verify user identity (employee ID or manager confirmation)
2. Go to **Azure AD / Entra** → Users → Find user
3. Click **Reset Password** and choose a temporary password
4. Advise user to change password on next login
5. If account is locked, click **Unlock** before reset

---

## VPN Connection Issues

**Symptoms**: User cannot connect to VPN, times out

**Resolution**:
1. Verify user's VPN credentials are correct
2. Check if VPN client is up to date
3. Ask user to try a different network (home vs hotspot)
4. Check CrowdStrike for any endpoint policy blocks
5. Escalate to Tier 2 if connection issues persist

---

## Outlook Not Syncing

**Symptoms**: Emails not appearing, calendar not updating

**Resolution**:
1. Check internet connectivity
2. Remove and re-add the email account in Outlook
3. Run **Repair** from Control Panel > Programs > Office
4. Check M365 service status at [status.office365.com](https://status.office365.com)

---

## Slow Computer

**Symptoms**: System sluggish, programs slow to open

**Resolution**:
1. Check Task Manager for high CPU/RAM processes
2. Ensure Windows Updates are not running in background
3. Run **Disk Cleanup** to free space
4. Check CrowdStrike for active scans
5. Restart the machine if not done recently
6. Consider RAM upgrade if consistently at >85% usage

---

## Printer Not Working

**Symptoms**: Print jobs stuck, printer offline

**Resolution**:
1. Check physical connections and paper/toner
2. Clear the print queue: Services → Print Spooler → Restart
3. Remove and re-add the printer
4. Reinstall printer drivers from manufacturer website
5. Check network connectivity if it's a network printer

---

## Software Installation Requests

**Process**:
1. Verify software is on the approved software list
2. Check license availability
3. If approved, deploy via SCCM or remote session
4. Document in FreshService ticket
5. If not on approved list → escalate for IT Manager approval
`,
    parentId: 'troubleshooting-folder',
    type: 'file',
  },
}

const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.setAttribute('data-theme', next)
      },

      // Categories
      categories: DEFAULT_CATEGORIES,
      addCategory: (name) => set((state) => ({
        categories: [...state.categories, name],
      })),
      renameCategory: (oldName, newName) => set((state) => ({
        categories: state.categories.map((c) => (c === oldName ? newName : c)),
        tools: state.tools.map((t) => (t.category === oldName ? { ...t, category: newName } : t)),
      })),
      deleteCategory: (name) => set((state) => ({
        categories: state.categories.filter((c) => c !== name),
        tools: state.tools.filter((t) => t.category !== name),
      })),
      reorderCategories: (categories) => set({ categories }),

      // Tools
      tools: DEFAULT_TOOLS,
      addTool: (tool) => set((state) => ({
        tools: [...state.tools, { ...tool, id: `tool-${Date.now()}` }],
      })),
      updateTool: (id, updates) => set((state) => ({
        tools: state.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      deleteTool: (id) => set((state) => ({
        tools: state.tools.filter((t) => t.id !== id),
      })),
      reorderTools: (category, orderedIds) => set((state) => {
        const otherTools = state.tools.filter((t) => t.category !== category)
        const categoryTools = orderedIds
          .map((id) => state.tools.find((t) => t.id === id))
          .filter(Boolean)
        return { tools: [...otherTools, ...categoryTools] }
      }),

      // Docs
      docs: DEFAULT_DOCS,
      activeDocId: null,
      setActiveDoc: (id) => set({ activeDocId: id }),
      addDoc: (doc) => set((state) => ({
        docs: {
          ...state.docs,
          [doc.id]: doc,
        },
      })),
      updateDoc: (id, updates) => set((state) => ({
        docs: {
          ...state.docs,
          [id]: { ...state.docs[id], ...updates },
        },
      })),
      deleteDoc: (id) => set((state) => {
        const newDocs = { ...state.docs }
        // Recursively delete children
        const deleteRecursive = (docId) => {
          Object.values(newDocs).forEach((doc) => {
            if (doc.parentId === docId) {
              deleteRecursive(doc.id)
            }
          })
          delete newDocs[docId]
        }
        deleteRecursive(id)
        return {
          docs: newDocs,
          activeDocId: state.activeDocId === id ? null : state.activeDocId,
        }
      }),

      // Export/Import
      exportConfig: () => {
        const state = get()
        return JSON.stringify({
          categories: state.categories,
          tools: state.tools,
          docs: state.docs,
        }, null, 2)
      },
      importConfig: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            categories: data.categories || DEFAULT_CATEGORIES,
            tools: data.tools || DEFAULT_TOOLS,
            docs: data.docs || DEFAULT_DOCS,
          })
          return true
        } catch {
          return false
        }
      },
      resetToDefaults: () => set({
        theme: 'light',
        categories: DEFAULT_CATEGORIES,
        tools: DEFAULT_TOOLS,
        docs: DEFAULT_DOCS,
        activeDocId: null,
      }),
    }),
    {
      name: 'hdesk_wiki_store',
      partialize: (state) => ({
        theme: state.theme,
        categories: state.categories,
        tools: state.tools,
        docs: state.docs,
        activeDocId: state.activeDocId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme || 'light')
        }
      },
    }
  )
)

export default useAppStore
