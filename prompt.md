# BUILD THE COMPLETE FUNCTIONAL WEBSITE — NOT JUST A UI MOCKUP

Use the UI/reference images I have provided in this Google AI Studio project as the **primary visual source of truth**.

The goal is to transform the demonstrated design into a **fully functional, production-structured web application** while preserving the existing visual identity as closely as possible.

## 1. IMPORTANT: PRESERVE THE EXISTING DESIGN

Do NOT redesign the interface from scratch.

Keep the existing:

- Layout
- Typography
- Fonts
- Font sizes
- Visual hierarchy
- Spacing
- Cards
- Borders
- Border radius
- Icons
- Buttons
- Navigation
- Colors
- Dark/light visual treatment
- Chatbot appearance
- Notes/workspace appearance
- Overall visual language

The website should feel like the **same product shown in the reference images**, only significantly more functional.

Make the interface highly customizable **without substantially changing the original UI**.

If a functionality requires a new control, place it naturally inside the existing design rather than creating a completely new interface.

---

# 2. USE THE REFERENCE IMAGES INTELLIGENTLY

Analyze the provided images yourself and identify:

- Navbar
- Sidebar
- Buttons
- Cards
- Inputs
- Chat interface
- Notes/workspace areas
- Toolbars
- Tabs
- Containers
- Images
- Icons
- Forms
- Interactive controls
- Spacing relationships
- Typography hierarchy
- Desktop/mobile differences

Automatically reproduce the visual structure in actual HTML/CSS rather than creating a static screenshot.

The generated application must be genuinely interactive.

Do not simply place the screenshot as an image.

---

# 3. TECHNOLOGY STACK

Use a modern, maintainable full-stack architecture.

Frontend:

- HTML5
- CSS3
- JavaScript
- Use a component-based JavaScript framework if it improves maintainability, preferably React
- Responsive CSS
- Modern browser APIs where appropriate

Backend:

- Use a proper backend such as Node.js + Express, or another appropriate secure backend technology.
- PHP may be used if it is genuinely more appropriate for the project, but do NOT use PHP simply because it is familiar.
- Keep frontend and backend responsibilities clearly separated.

Database:

Use a proper database architecture for persistent application data.

The architecture should be capable of storing:

- Users
- Workbooks
- Notes
- Text notes
- Voice/audio notes
- Uploaded files
- Images
- Projects
- User preferences
- AI-generated content
- Metadata

Use a database abstraction/ORM where appropriate.

---

# 4. PROJECT STRUCTURE

Create a clean, scalable project structure.

Separate:

- Frontend
- Backend
- API routes
- Database logic
- Authentication
- File handling
- AI services
- Components
- Pages
- Styles
- Utilities
- Configuration
- Environment variables

Do not put the entire application inside one huge HTML or JavaScript file.

Keep components modular and reusable.

---

# 5. SECURITY — VERY IMPORTANT

Treat security as a first-class requirement.

Do NOT expose secret API keys inside frontend JavaScript.

Use environment variables for:

- AI API keys
- Database credentials
- Authentication secrets
- Encryption secrets
- Storage credentials
- Other private configuration

The browser should communicate with the backend rather than directly exposing private server credentials.

Implement appropriate:

- Input validation
- Output validation
- Authentication
- Authorization
- Secure password handling if passwords are used
- Session/token security
- CORS configuration
- CSRF protection where applicable
- XSS protection
- SQL injection protection
- Rate limiting
- File validation
- File-size limits
- MIME-type validation
- Secure filename handling
- Secure upload storage
- Error handling

Never trust client-side validation alone.

Validate important data again on the server.

Never return sensitive server errors, stack traces, API keys, database credentials, or internal paths to users.

Use HTTPS-compatible architecture.

---

# 6. AUTHENTICATION AND USER DATA

Create the application so that users can eventually have their own accounts and private workspaces.

Support a secure authentication architecture.

Users should only be able to access their own:

- Workbooks
- Notes
- Audio
- Uploaded files
- Projects
- Settings
- AI-generated content

Do not rely on IDs supplied by the frontend alone to determine ownership.

Verify authorization on every protected backend operation.

---

# 7. WORKBOOK SYSTEM

The application must support multiple workbooks.

A user should be able to:

- Create a workbook
- Rename a workbook
- Delete a workbook
- Open a workbook
- Switch between workbooks
- Create notes inside a workbook
- Add files to a workbook
- Add audio notes to a workbook
- Return to previously created workbooks at any time

The **main menu/sidebar** should contain an easily accessible workbook section.

Example structure:

WORKBOOKS

- Workbook 1
- Workbook 2
- Workbook 3
- + New Workbook

Do not make the user recreate a workbook every time they open the application.

Persist workbooks in the database.

---

# 8. NOTES SYSTEM

Make the notes system much more capable while preserving the existing notes UI.

Users should be able to create:

### Text notes

Add a text box/editor below the existing notes area.

The user must be able to:

- Type notes
- Edit notes
- Delete notes
- Save notes
- Auto-save notes
- Format text where appropriate
- Copy text
- Paste text
- Search notes

### Voice/audio notes

Allow users to:

- Record audio
- Stop recording
- Pause/resume recording if supported
- Play recordings
- Delete recordings
- Save recordings
- Associate recordings with the current workbook/note

Ask for microphone permission naturally through the browser.

Handle unsupported microphone/browser situations gracefully.

### File-based notes

Allow notes/workbooks to contain files such as:

- PDF
- JPG
- JPEG
- PNG
- WebP
- SVG where safe
- TXT
- DOCX where supported
- Other useful document formats where technically appropriate

Do not pretend that every format is supported if it is not.

Clearly validate and handle unsupported formats.

---

# 9. FILE UPLOAD AND IMPORT

Add a clear file/add attachment control without disturbing the existing UI.

Support:

- Drag & drop
- File picker
- Paste image
- Upload JPG
- Upload JPEG
- Upload PNG
- Upload WebP
- Screenshot support

The user should be able to drag files directly into the appropriate workspace.

Display useful upload feedback:

- Uploading
- Processing
- Completed
- Failed
- Unsupported format
- File too large

Allow users to remove uploaded files.

Keep uploaded files associated with the correct workbook.

---

# 10. IMAGE INPUT

The application should support image-based input.

Allow the user to:

- Drag an image into the workspace
- Paste an image from the clipboard
- Upload an image
- Use a screenshot as input

For screenshots/images, allow the AI system to analyze the visual content when appropriate.

---

# 11. AI IMAGE → WEBSITE CONVERSION

Create the actual AI image-to-website workflow.

The application should be able to receive:

- JPG
- JPEG
- PNG
- WebP
- Screenshot
- Pasted image

The AI should analyze the image and detect:

- Overall layout
- Sections
- Navbar
- Sidebar
- Cards
- Buttons
- Forms
- Inputs
- Images
- Icons
- Text areas
- Containers
- Columns
- Spacing
- Typography
- Borders
- Colors
- Responsive relationships

Then generate functional:

- HTML
- CSS
- JavaScript

Do not only reproduce the image visually.

Convert identifiable UI elements into real interactive components.

For example:

A button in the screenshot should become a real button.

A text field should become a real input.

A navigation element should actually navigate.

A card should be represented as a real component.

---

# 12. RESPONSIVE PREVIEW

Create a responsive preview system.

The preview must support:

- Desktop
- Tablet
- Mobile

Allow the user to switch between device modes.

Also allow the preview frame to be resized manually.

The generated website must respond naturally when the preview dimensions change.

Do not simply scale the entire website like an image.

Actually implement responsive HTML/CSS.

---

# 13. LIVE CODE EDITOR

Add a live code editor while preserving the existing visual design.

Provide separate editors/tabs for:

- HTML
- CSS
- JavaScript

Changes made in the editor should update the preview immediately or with a very short debounce.

The editor should have:

- Syntax highlighting
- Line numbers
- Code formatting where practical
- Error detection
- Clear error messages
- Reset/restore capability

Do not reload the entire application unnecessarily whenever code changes.

---

# 14. DESIGN CONTROLS

Add a design-control system that allows users to customize the generated website.

Controls should include:

- Colors
- Background colors
- Text colors
- Fonts
- Font sizes
- Border radius
- Spacing
- Padding
- Margins
- Shadows
- Container width
- Section height
- Alignment

Keep these controls visually consistent with the existing interface.

Do not overwhelm the user with every possible setting immediately.

Use progressive disclosure:

Basic controls first.

Advanced controls can be opened when needed.

---

# 15. MOVABLE / CUSTOMIZABLE ELEMENTS

This is especially important.

Allow users to customize the generated website visually.

Where appropriate, elements should be movable/resizable.

Support:

- Dragging boxes/sections
- Moving cards
- Resizing containers
- Repositioning elements
- Adjusting spacing
- Changing widths/heights

Do not make the entire interface chaotic.

Use snapping/grid/alignment assistance where useful.

Changes should update the underlying generated HTML/CSS rather than merely moving an overlay on top of the preview.

---

# 16. REGENERATE SELECTED SECTION

Allow users to select a specific section of the generated website.

For example:

User selects a card and writes:

> Make this card more modern.

The AI should modify ONLY the selected component/section.

It must not unnecessarily regenerate the entire website.

Other sections should remain unchanged.

Support prompts such as:

- Make this card more modern
- Increase the spacing
- Make this section responsive
- Change this button style
- Improve this navbar
- Make this form cleaner

Show the user what changed where practical.

---

# 17. PROMPT-BASED WEBSITE EDITING

Provide a natural-language editing interface.

Users should be able to write requests such as:

- Make it responsive
- Use a dark theme
- Add animations
- Make the navbar sticky
- Convert this to a landing page
- Increase the spacing
- Make the cards more modern
- Change the font
- Make the mobile version cleaner
- Add a footer
- Simplify this section

The AI should understand the existing generated code and modify it rather than blindly creating a new website.

Maintain design consistency.

---

# 18. AI EDITING SAFETY

Before applying major AI-generated changes:

- Validate generated code
- Prevent malformed HTML
- Prevent obvious JavaScript errors
- Sanitize unsafe content
- Avoid dangerous arbitrary code execution
- Keep changes scoped to the requested area where possible

Do not execute untrusted generated code directly on the server.

Use an isolated/sandboxed preview environment for generated website code where appropriate.

---

# 19. EXPORT

Provide export functionality.

Users should be able to:

- Download HTML
- Download CSS
- Download JavaScript
- Download all files as ZIP
- Copy HTML
- Copy CSS
- Copy JavaScript
- Export project files
- Export assets
- Export the complete generated website

The exported project should actually work when opened/run according to the generated project's requirements.

If backend functionality is required, clearly separate frontend-only exports from full-stack project exports.

---

# 20. GITHUB EXPORT

Add the ability to export/push a project to GitHub.

Do this securely.

Do not ask users to expose GitHub personal access tokens in frontend code.

Use an appropriate OAuth/API architecture.

Allow users to choose:

- Repository name
- Public/private repository where supported
- Project files
- README generation

Show clear success/error states.

---

# 21. ASSET MANAGEMENT

Create an asset management system.

Users should be able to:

- See extracted images
- See uploaded images
- Replace images
- Upload custom assets
- Delete assets
- Reuse assets
- Associate assets with specific sections

Support common web image formats.

When replacing an image, update the corresponding component rather than requiring the user to manually edit code.

---

# 22. SCREENSHOT SUPPORT

Add screenshot functionality where technically possible.

Support:

- Pasting screenshots
- Uploading screenshots
- Dragging screenshots
- Browser-supported screenshot capture workflows

The screenshot should be usable as an input to the image-to-website conversion process.

---

# 23. INTERACTIVE BUTTONS AND INPUTS

Every visible button that implies an action should actually perform that action.

Do not create decorative buttons.

Implement interactions for:

- Navigation
- Add note
- Add audio
- Add file
- Upload
- Delete
- Save
- Export
- Copy
- Regenerate
- Preview device selection
- Code editor tabs
- Design controls
- Workbook creation
- Workbook switching
- Settings
- Search
- Undo/redo where appropriate

Show loading, success, disabled, and error states where needed.

---

# 24. WINDOWS + ANDROID SUPPORT

The application must work properly on:

### Windows / Desktop Web

Optimize for:

- Mouse
- Keyboard
- Large screens
- Multi-column layouts
- Resizable panels
- Drag & drop
- Keyboard shortcuts

### Android / Mobile Web

Optimize for:

- Touch
- Small screens
- Mobile navigation
- Touch-friendly buttons
- Responsive layouts
- Mobile-friendly text inputs
- Mobile file selection
- Microphone recording
- Clipboard/image pasting where browser support exists

Do not simply shrink the desktop UI.

Create an appropriate responsive mobile layout while keeping the same design language.

The desktop and Android versions should feel like the **same application**, not two unrelated products.

---

# 25. TOUCH + MOUSE INTERACTION

Support both interaction models.

Desktop:

- Click
- Double click
- Right click where useful
- Drag & drop
- Keyboard shortcuts
- Mouse resizing

Mobile:

- Tap
- Long press where useful
- Touch dragging
- Touch-friendly controls
- Swipe/navigation where appropriate

Do not make controls so small that they become difficult to use on Android.

---

# 26. AUDIO INPUT

Implement real voice-note functionality.

Use browser-supported microphone APIs where appropriate.

Handle:

- Permission requests
- Permission denied
- Unsupported browsers
- Recording state
- Playback
- Audio file storage
- Deletion
- Error states

Do not merely create a microphone icon without functionality.

---

# 27. DATA PERSISTENCE

The following should persist after refreshing/reopening the application:

- Workbooks
- Notes
- Audio notes
- Uploaded files
- Generated websites
- Code
- Design settings
- Assets
- User preferences

Do not rely exclusively on temporary frontend variables.

Use appropriate persistent storage.

---

# 28. AUTO-SAVE

Implement reliable auto-save.

When users edit:

- Notes
- Code
- Design settings
- Workbook information

save changes without requiring them to constantly press Save.

Clearly indicate saving state when useful:

- Saving…
- Saved
- Failed to save

Avoid excessive API requests by using debouncing/batching where appropriate.

---

# 29. UNDO / REDO

Where practical, implement:

- Undo
- Redo
- Restore previous version

Especially for AI-generated code modifications and visual design changes.

Avoid permanently destroying the previous state after every AI regeneration.

---

# 30. ERROR HANDLING

The application must gracefully handle:

- Network failure
- AI failure
- Invalid input
- Invalid file
- File too large
- Unsupported file
- Microphone denial
- Authentication failure
- Database failure
- Code-generation failure
- Preview rendering failure

Never leave the user staring at a broken blank screen.

Give useful error messages.

---

# 31. PERFORMANCE

Optimize the application for real-world use.

Consider:

- Lazy loading
- Debouncing
- Efficient rendering
- Caching
- Image compression
- File size limits
- Efficient database queries
- Avoiding unnecessary API calls
- Avoiding unnecessary re-renders
- Efficient preview rendering

Do not sacrifice the visual design for performance, but avoid obvious performance problems.

---

# 32. ACCESSIBILITY

Implement proper:

- Semantic HTML
- Keyboard navigation
- Focus states
- ARIA labels where necessary
- Screen-reader-friendly controls
- Sufficient contrast
- Accessible form labels
- Touch-friendly controls

Do not rely exclusively on icons without accessible labels/tooltips.

---

# 33. BROWSER COMPATIBILITY

Make the application work reliably on modern:

- Chrome
- Edge
- Firefox
- Android Chrome

Gracefully handle browser features that are unavailable.

---

# 34. SECURITY FOR GENERATED WEBSITES

The live preview is potentially executing AI-generated HTML/CSS/JS.

Treat generated code as untrusted.

Use a secure isolated/sandboxed preview architecture.

Prevent generated preview code from gaining unnecessary access to:

- Parent application
- Authentication tokens
- Cookies
- Local application data
- Backend secrets
- Internal APIs

Use iframe sandboxing or an equivalent secure isolation mechanism where appropriate.

---

# 35. API ARCHITECTURE

Create clean backend API endpoints.

For example, organize functionality around concepts such as:

- Authentication
- Workbooks
- Notes
- Files
- Audio
- Projects
- AI generation
- AI editing
- Assets
- Export
- GitHub integration

Use proper HTTP methods and status codes.

Validate request bodies on the server.

Return consistent API responses.

---

# 36. ENVIRONMENT CONFIGURATION

Create a proper `.env` / environment configuration strategy.

Never hard-code:

- API keys
- Passwords
- Database credentials
- JWT secrets
- OAuth secrets
- Private tokens

Provide an example environment configuration file such as `.env.example` without real secrets.

---

# 37. DATABASE DESIGN

Create sensible relationships between entities.

For example:

User
→ Workbooks
→ Notes
→ Attachments
→ Audio Notes
→ Website Projects
→ Assets
→ Generated Versions

Use indexes where appropriate.

Prevent orphaned records.

Handle deletion carefully.

---

# 38. FILE STORAGE

Do not blindly store large binary files directly in database fields unless appropriate.

Use a proper storage architecture for larger:

- Images
- Audio
- PDFs
- Documents
- Project archives

Store metadata and references in the database.

Validate uploads before storing them.

---

# 39. UI STATE

Implement proper states for:

- Loading
- Empty
- Selected
- Hover
- Focus
- Disabled
- Error
- Success
- Saving
- Processing
- Uploading
- Recording

The UI should always communicate what is happening.

---

# 40. DO NOT OVERDESIGN

This is extremely important.

Do not add unnecessary UI panels, gradients, animations, menus, dashboards, or decorative elements merely because they are technically possible.

The original reference design should remain recognizable.

**Functionality should be added around the existing design rather than replacing it.**

If you need to introduce a new feature, find the most natural place within the current interface.

---

# 41. IMPROVE THE DESIGN WHEN NECESSARY

You have permission to make **small, thoughtful improvements** when they improve usability.

For example:

- Add a text input below the notes section because users need typed notes in addition to voice notes.
- Add an attachment button for files.
- Add a workbook switcher to the main menu.
- Add a responsive device selector.
- Add an unobtrusive design-controls panel.
- Add drag handles when elements become movable.
- Add tooltips for unfamiliar icons.
- Add better empty states.
- Add confirmation for destructive actions.

These changes should feel like natural extensions of the original design.

**Do not redesign the entire interface.**

---

# 42. DESIGN CONSISTENCY

Whenever you introduce a new component, reuse the existing design system.

Match:

- Font
- Font weight
- Spacing
- Radius
- Border treatment
- Shadows
- Icons
- Button shape
- Input styling
- Color system
- Animation style

New functionality should look as though it was part of the original design from the beginning.

---

# 43. MOBILE UI

On Android/mobile:

- Convert sidebars into appropriate mobile navigation
- Make buttons touch-friendly
- Stack panels when necessary
- Keep important actions easily reachable
- Avoid horizontal overflow
- Keep text readable
- Make note entry comfortable
- Make audio recording accessible
- Make file uploading simple

Do not remove important functionality simply because the screen is smaller.

Use responsive/adaptive layouts.

---

# 44. DESKTOP UI

On Windows:

Take advantage of available screen space.

Support:

- Resizable panels
- Side-by-side editor/preview
- Multi-panel workspace
- Keyboard shortcuts
- Drag-and-drop
- Larger code editor
- Desktop file upload

But keep the visual style from the supplied design.

---

# 45. TEST THE APPLICATION

After implementation, test the actual functionality.

Verify:

1. Website loads.
2. Navigation works.
3. Buttons work.
4. Inputs work.
5. Text notes can be created.
6. Audio notes can be recorded.
7. Files can be uploaded.
8. Images can be pasted.
9. Drag & drop works.
10. Workbooks can be created.
11. Workbooks persist.
12. Notes persist.
13. AI image-to-website conversion works.
14. Generated HTML/CSS/JS renders.
15. Code editor updates preview.
16. Responsive preview works.
17. Design controls work.
18. Selected-section regeneration works.
19. AI prompt editing works.
20. Undo/redo works where implemented.
21. Export works.
22. ZIP export works.
23. GitHub integration works where configured.
24. Android layout works.
25. Windows layout works.
26. Errors are handled gracefully.
27. API keys are not exposed.
28. Unauthorized users cannot access another user's data.
29. Uploaded files are validated.
30. Generated code is safely sandboxed.

Fix issues you discover instead of leaving TODO placeholders.

---

# 46. IMPORTANT IMPLEMENTATION RULE

Do not stop after generating the frontend.

Do not give me only:

- HTML mockup
- CSS mockup
- Static JavaScript
- Fake buttons
- Fake upload controls
- Fake AI responses
- Fake database
- Fake authentication

Build the actual application architecture.

If an external service/API requires credentials that are not available, implement the integration correctly with environment-variable placeholders and clearly indicate what configuration is required.

Do not put fake functionality in place of real functionality unless there is genuinely no external service available.

---

# 47. CODE QUALITY

Write maintainable production-quality code.

Use:

- Reusable components
- Clear naming
- Modular files
- Consistent formatting
- Comments only where useful
- Error boundaries/handling where appropriate
- Validation
- Secure API design
- Separation of concerns

Avoid:

- Massive single files
- Duplicate code
- Hard-coded secrets
- Unnecessary dependencies
- Dead code
- Placeholder functionality
- Console errors
- Broken links
- Unused UI controls

---

# 48. FINAL PRINCIPLE

Think of this as taking the supplied **UI prototype/reference images and turning them into a real application**.

The priority order is:

1. Preserve the visual design.
2. Make the application genuinely functional.
3. Add the missing functionality intelligently.
4. Keep the UI simple and recognizable.
5. Make it responsive for Windows and Android.
6. Make the backend secure and scalable.
7. Persist user data.
8. Make AI interactions actually modify the application.
9. Make files, notes, audio, workbooks, and exports genuinely work.
10. Test everything.

**Do not sacrifice the existing UI in order to add functionality.**

The final result should look like the reference design, but behave like a complete, polished application.